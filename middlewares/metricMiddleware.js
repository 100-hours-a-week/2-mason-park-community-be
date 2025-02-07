const client = require("prom-client");
const { collectDefaultMetrics, register } = client;

// 기본 시스템 메트릭 자동 수집
collectDefaultMetrics();

// HTTP 요청 카운터
const httpRequestCounter = new client.Counter({
    name: "http_requests_total",
    help: "Total number of HTTP requests",
    labelNames: ["method", "route", "status"],
});

// HTTP 요청 처리 속도 (Histogram)
const responseTimeHistogram = new client.Histogram({
    name: "http_request_duration_seconds",
    help: "Histogram of response time duration for HTTP requests",
    labelNames: ["method", "route", "status"],
    buckets: [0.1, 0.3, 0.5, 1, 2, 5], // 응답 시간 버킷 (초 단위)
});

// 현재 활성 요청 수 (Gauge)
const activeRequestsGauge = new client.Gauge({
    name: "http_active_requests",
    help: "The number of currently active HTTP requests",
});

// 메모리 & CPU 모니터링
const memoryUsageGauge = new client.Gauge({
    name: "node_memory_usage_bytes",
    help: "Memory usage of the Node.js process",
    labelNames: ["type"]
});

const cpuLoadGauge = new client.Gauge({
    name: "node_cpu_load",
    help: "CPU load average"
});

// 요청 처리 미들웨어
const prometheusMiddleware = (req, res, next) => {
    const start = Date.now();
    activeRequestsGauge.inc(); // 요청 시작 시 +1

    res.on("finish", () => {
        const duration = (Date.now() - start) / 1000;
        responseTimeHistogram.observe({ method: req.method, route: req.path, status: res.statusCode }, duration);
        httpRequestCounter.inc({ method: req.method, route: req.path, status: res.statusCode });
        activeRequestsGauge.dec(); // 요청 완료 시 -1
    });

    next();
};

// 5초마다 메모리 & CPU 사용량 업데이트
setInterval(() => {
    const memoryUsage = process.memoryUsage();
    memoryUsageGauge.set({ type: "rss" }, memoryUsage.rss);
    memoryUsageGauge.set({ type: "heapTotal" }, memoryUsage.heapTotal);
    memoryUsageGauge.set({ type: "heapUsed" }, memoryUsage.heapUsed);

    const [oneMin] = require("os").loadavg();
    cpuLoadGauge.set(oneMin);
}, 5000);

// Prometheus 메트릭 엔드포인트
const metricsEndpoint = async (req, res) => {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
};

module.exports = { prometheusMiddleware, metricsEndpoint };