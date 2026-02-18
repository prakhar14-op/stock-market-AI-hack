"""
QuantPulse Backend Configuration

Production-grade configuration with multi-provider stock data support.
Safely handles both local development and production deployment environments.
"""

import os
import logging

# =============================================================================
# Environment Detection and Configuration Loading
# =============================================================================

# Detect environment (development/production)
ENV = os.getenv("ENV", "development")

# Load .env ONLY for local development
if ENV == "development":
    try:
        from dotenv import load_dotenv
        load_dotenv()
        print(f"🔧 Running in {ENV} mode - loaded .env file")
    except ImportError:
        print(f"🔧 Running in {ENV} mode - python-dotenv not installed")
    except Exception as e:
        print(f"🔧 Running in {ENV} mode - .env loading failed: {e}")
else:
    print(f"🚀 Running in {ENV} mode - using system environment variables")

# =============================================================================
# Application Metadata
# =============================================================================

APP_NAME = "QuantPulse India Backend"
APP_VERSION = "2.0.0"
APP_DESCRIPTION = "Production-grade backend API with multi-provider stock data engine"

# =============================================================================
# API Keys Configuration
# =============================================================================

# Stock Data Provider API Keys
TWELVEDATA_API_KEY = os.getenv("TWELVEDATA_API_KEY")
FINNHUB_API_KEY = os.getenv("FINNHUB_API_KEY")
STOCK_PROVIDER = os.getenv("STOCK_PROVIDER", "auto")  # auto, twelvedata, finnhub, demo

# News API Configuration
NEWSAPI_KEY = os.getenv("NEWSAPI_KEY")

# =============================================================================
# Demo Mode Detection
# =============================================================================

# Automatically enable demo mode if no stock API keys are available
DEMO_MODE = not (TWELVEDATA_API_KEY or FINNHUB_API_KEY)

# =============================================================================
# Server Configuration
# =============================================================================

HOST = "0.0.0.0"
PORT = int(os.getenv("PORT", 8000))

# CORS Configuration
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://localhost:8080",
]

# =============================================================================
# Cache Configuration
# =============================================================================

CACHE_MAX_SIZE = int(os.getenv("CACHE_MAX_SIZE", 10000))
CACHE_DEFAULT_TTL = int(os.getenv("CACHE_DEFAULT_TTL", 3600))

# =============================================================================
# Logging Configuration
# =============================================================================

LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

def setup_logging():
    """Setup application logging with environment-appropriate configuration"""
    log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    date_format = "%Y-%m-%d %H:%M:%S"
    
    logging.basicConfig(
        level=getattr(logging, LOG_LEVEL.upper()),
        format=log_format,
        datefmt=date_format
    )
    
    # Log environment info
    logger = logging.getLogger(__name__)
    logger.info(f"🔧 Environment: {ENV}")
    logger.info(f"📊 Log Level: {LOG_LEVEL}")

# =============================================================================
# Startup Validation and Logging
# =============================================================================

def validate_and_log_configuration():
    """
    Validate configuration and log startup information.
    This function is called during application startup.
    """
    logger = logging.getLogger(__name__)
    
    # Log environment and basic info
    logger.info("=" * 60)
    logger.info(f"🚀 {APP_NAME} v{APP_VERSION}")
    logger.info(f"🔧 Environment: {ENV}")
    logger.info(f"🌐 Server: http://{HOST}:{PORT}")
    logger.info("=" * 60)
    
    # Validate and log API key status
    api_keys_available = []
    api_keys_missing = []
    
    # Stock API Keys
    if TWELVEDATA_API_KEY:
        logger.info("✅ TWELVEDATA_API_KEY loaded - primary provider available")
        api_keys_available.append("TwelveData")
    else:
        logger.warning("⚠️ TWELVEDATA_API_KEY missing - primary provider disabled")
        api_keys_missing.append("TwelveData")
    
    if FINNHUB_API_KEY:
        logger.info("✅ FINNHUB_API_KEY loaded - fallback provider available")
        api_keys_available.append("Finnhub")
    else:
        logger.warning("⚠️ FINNHUB_API_KEY missing - fallback provider disabled")
        api_keys_missing.append("Finnhub")
    
    # News API Key
    if NEWSAPI_KEY:
        logger.info("✅ NEWSAPI_KEY loaded - news service available")
        api_keys_available.append("NewsAPI")
    else:
        logger.warning("⚠️ NEWSAPI_KEY missing - news service may be limited")
        api_keys_missing.append("NewsAPI")
    
    # Demo Mode Detection
    if DEMO_MODE:
        logger.warning("🔄 No stock API keys detected - running in DEMO MODE")
        logger.warning("🔄 All stock data will be simulated for demonstration")
        if ENV == "production":
            logger.error("❌ PRODUCTION deployment without API keys - this is not recommended!")
    else:
        logger.info("📊 API keys detected - running in LIVE MODE")
        logger.info(f"📊 Available providers: {', '.join(api_keys_available)}")
    
    # Stock Provider Mode
    logger.info(f"📊 Stock provider mode: {STOCK_PROVIDER}")
    
    # Cache Configuration
    logger.info(f"💾 Cache configuration: max_size={CACHE_MAX_SIZE}, default_ttl={CACHE_DEFAULT_TTL}s")
    
    # Security reminder for production
    if ENV == "production" and api_keys_missing:
        logger.warning("🔐 Security reminder: Ensure API keys are set in production environment")
    
    logger.info("=" * 60)
    
    return {
        "environment": ENV,
        "demo_mode": DEMO_MODE,
        "api_keys_available": api_keys_available,
        "api_keys_missing": api_keys_missing,
        "stock_provider_mode": STOCK_PROVIDER
    }

# =============================================================================
# Configuration Export
# =============================================================================

# Export all configuration for easy importing
__all__ = [
    # Environment
    "ENV",
    "DEMO_MODE",
    
    # Application
    "APP_NAME",
    "APP_VERSION", 
    "APP_DESCRIPTION",
    
    # API Keys
    "TWELVEDATA_API_KEY",
    "FINNHUB_API_KEY",
    "NEWSAPI_KEY",
    "STOCK_PROVIDER",
    
    # Server
    "HOST",
    "PORT",
    "ALLOWED_ORIGINS",
    
    # Cache
    "CACHE_MAX_SIZE",
    "CACHE_DEFAULT_TTL",
    
    # Logging
    "LOG_LEVEL",
    
    # Functions
    "setup_logging",
    "validate_and_log_configuration"
]

# Debug: Print loaded values (remove in production)
if ENV == "development":
    print(f"DEBUG: TWELVEDATA_API_KEY = {'***' if TWELVEDATA_API_KEY else 'None'}")
    print(f"DEBUG: FINNHUB_API_KEY = {'***' if FINNHUB_API_KEY else 'None'}")
    print(f"DEBUG: DEMO_MODE = {DEMO_MODE}")
