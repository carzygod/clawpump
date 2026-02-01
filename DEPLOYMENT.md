# Production Deployment Configuration

All configuration files have been updated for production deployment.

## 🌐 Production URLs

- **Frontend**: https://clawpump.sid.mom
- **API**: https://clawpump-api.sid.mom

## 📝 Updated Files

- `.env` - Main configuration
- `.env.example` - Example configuration
- `src/App.jsx` - Frontend API URL configuration
- `skill.md` - All code examples updated
- `test/bot-launch.test.js` - Test configuration
- Documentation files updated

## 🚀 Quick Deploy

### Backend
```bash
# Environment is configured in .env
npm run server:dev
```

### Frontend
```bash
# Build with production API URL
npm run build
# Deploy dist/ folder to web server
```

## ✅ Configuration Summary

All localhost references have been replaced with production URLs:
- ~~http://localhost:3001~~ → **https://clawpump-api.sid.mom**
- ~~http://localhost:5173~~ → **https://clawpump.sid.mom**

See `部署配置.md` for detailed Chinese documentation.
