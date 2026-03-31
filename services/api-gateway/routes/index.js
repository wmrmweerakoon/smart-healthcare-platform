const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('../config/config');
const { verifyToken } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

const setupRoutes = (app) => {
    // ─── Auth Service (public routes — no token required) ────────────
    app.use(
        '/api/auth',
        createProxyMiddleware({
            target: config.services.auth,
            changeOrigin: true,
            pathRewrite: { '^/api/auth': '' },
            on: {
                proxyReq: (proxyReq, req) => {
                    // Forward body for POST requests
                    if (req.body && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
                        const bodyData = JSON.stringify(req.body);
                        proxyReq.setHeader('Content-Type', 'application/json');
                        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
                        proxyReq.write(bodyData);
                    }
                },
            },
        })
    );

    // ─── Patient Service (requires authentication, patient role) ─────
    app.use(
        '/api/patient',
        verifyToken,
        roleCheck('patient', 'admin'),
        createProxyMiddleware({
            target: config.services.patient,
            changeOrigin: true,
            pathRewrite: { '^/api/patient': '' },
            on: {
                proxyReq: (proxyReq, req) => {
                    // Forward user info to downstream service
                    if (req.user) {
                        proxyReq.setHeader('X-User-Id', req.user.id);
                        proxyReq.setHeader('X-User-Role', req.user.role);
                    }
                    if (req.body && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
                        const bodyData = JSON.stringify(req.body);
                        proxyReq.setHeader('Content-Type', 'application/json');
                        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
                        proxyReq.write(bodyData);
                    }
                },
            },
        })
    );

    // ─── Doctor Service (requires authentication, doctor role) ───────
    app.use(
        '/api/doctor',
        verifyToken,
        roleCheck('doctor', 'admin'),
        createProxyMiddleware({
            target: config.services.doctor,
            changeOrigin: true,
            pathRewrite: { '^/api/doctor': '' },
            on: {
                proxyReq: (proxyReq, req) => {
                    if (req.user) {
                        proxyReq.setHeader('X-User-Id', req.user.id);
                        proxyReq.setHeader('X-User-Role', req.user.role);
                    }
                    if (req.body && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
                        const bodyData = JSON.stringify(req.body);
                        proxyReq.setHeader('Content-Type', 'application/json');
                        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
                        proxyReq.write(bodyData);
                    }
                },
            },
        })
    );

    // ─── Appointment Service (requires authentication, any role) ─────
    app.use(
        '/api/appointment',
        verifyToken,
        createProxyMiddleware({
            target: config.services.appointment,
            changeOrigin: true,
            pathRewrite: { '^/api/appointment': '' },
            on: {
                proxyReq: (proxyReq, req) => {
                    if (req.user) {
                        proxyReq.setHeader('X-User-Id', req.user.id);
                        proxyReq.setHeader('X-User-Role', req.user.role);
                    }
                    if (req.body && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
                        const bodyData = JSON.stringify(req.body);
                        proxyReq.setHeader('Content-Type', 'application/json');
                        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
                        proxyReq.write(bodyData);
                    }
                },
            },
        })
    );

    // ─── Payment Service (requires authentication) ──────────────────
    app.use(
        '/api/payment',
        verifyToken,
        createProxyMiddleware({
            target: config.services.payment,
            changeOrigin: true,
            pathRewrite: { '^/api/payment': '' },
            on: {
                proxyReq: (proxyReq, req) => {
                    if (req.user) {
                        proxyReq.setHeader('X-User-Id', req.user.id);
                        proxyReq.setHeader('X-User-Role', req.user.role);
                    }
                    if (req.body && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
                        const bodyData = JSON.stringify(req.body);
                        proxyReq.setHeader('Content-Type', 'application/json');
                        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
                        proxyReq.write(bodyData);
                    }
                },
            },
        })
    );

    // ─── Notification Service (requires authentication, admin only) ──
    app.use(
        '/api/notification',
        verifyToken,
        roleCheck('admin'),
        createProxyMiddleware({
            target: config.services.notification,
            changeOrigin: true,
            pathRewrite: { '^/api/notification': '' },
            on: {
                proxyReq: (proxyReq, req) => {
                    if (req.user) {
                        proxyReq.setHeader('X-User-Id', req.user.id);
                        proxyReq.setHeader('X-User-Role', req.user.role);
                    }
                    if (req.body && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
                        const bodyData = JSON.stringify(req.body);
                        proxyReq.setHeader('Content-Type', 'application/json');
                        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
                        proxyReq.write(bodyData);
                    }
                },
            },
        })
    );

    // ─── AI Service (public — no auth required) ─────────────────────
    app.use(
        '/api/ai',
        createProxyMiddleware({
            target: config.services.ai,
            changeOrigin: true,
            pathRewrite: { '^/api/ai': '' },
        })
    );

    // ─── Admin Service (requires authentication, admin only) ─────────
    app.use(
        '/api/admin',
        verifyToken,
        roleCheck('admin'),
        createProxyMiddleware({
            target: config.services.admin,
            changeOrigin: true,
            pathRewrite: { '^/api/admin': '' },
            on: {
                proxyReq: (proxyReq, req) => {
                    if (req.user) {
                        proxyReq.setHeader('X-User-Id', req.user.id);
                        proxyReq.setHeader('X-User-Role', req.user.role);
                    }
                    if (req.body && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
                        const bodyData = JSON.stringify(req.body);
                        proxyReq.setHeader('Content-Type', 'application/json');
                        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
                        proxyReq.write(bodyData);
                    }
                },
            },
        })
    );

    // ─── Telemedicine Service (video) ────────────────────────
    app.use(
        '/api/video',
        verifyToken,
        createProxyMiddleware({
            target: config.services.video,
            changeOrigin: true,
            pathRewrite: { '^/api/video': '' },
            on: {
                proxyReq: (proxyReq, req) => {
                    if (req.user) {
                        proxyReq.setHeader('X-User-Id', req.user.id);
                        proxyReq.setHeader('X-User-Role', req.user.role);
                    }
                    if (req.body && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
                        const bodyData = JSON.stringify(req.body);
                        proxyReq.setHeader('Content-Type', 'application/json');
                        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
                        proxyReq.write(bodyData);
                    }
                },
            },
        })
    );
};

module.exports = setupRoutes;
