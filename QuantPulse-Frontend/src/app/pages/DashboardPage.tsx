import { useState, useEffect, useCallback } from 'react';
import { StockInput } from '@/app/components/StockInput';
import { StockChart } from '@/app/components/StockChart';
import { SentimentIndicator } from '@/app/components/SentimentIndicator';
import { NewsSentiment } from '@/app/components/NewsSentiment';
import { MarketContextStrip } from '@/app/components/MarketContextStrip';
import { AIPredictionCard } from '@/app/components/AIPredictionCard';
import { StockMetrics } from '@/app/components/StockMetrics';
import { fetchStockData, fetchAIPrediction, fetchAgenticThesis, fetchEnsemblePrediction, type StockData, type AIPredictionData, type AgenticThesisData, type EnsembleData, type ApiError } from '@/app/services/api';
import { AgenticThesisCard } from '@/app/components/AgenticThesisCard';
import { PredictionEnsembleCard } from '@/app/components/PredictionEnsembleCard';
import { Loader2, AlertCircle } from 'lucide-react';

// Mock data generator for chart (keeping this for now until chart backend is ready)
const generateStockData = (basePrice: number) => {
  const data = [];
  let price = basePrice;

  for (let i = 0; i < 24; i++) {
    const change = (Math.random() - 0.5) * (basePrice * 0.02);
    price = price + change;
    data.push({
      time: `${9 + Math.floor(i / 2)}:${i % 2 === 0 ? '00' : '30'}`,
      price: Math.round(price * 100) / 100
    });
  }
  return data;
};

export function DashboardPage() {
  const [selectedStock, setSelectedStock] = useState('RELIANCE');

  // Data States
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [aiData, setAiData] = useState<AIPredictionData | null>(null);
  const [agenticData, setAgenticData] = useState<AgenticThesisData | null>(null);
  const [ensembleData, setEnsembleData] = useState<EnsembleData | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);

  // Loading & Error States
  const [isLoading, setIsLoading] = useState(true);
  const [isAgenticLoading, setIsAgenticLoading] = useState(false);
  const [isEnsembleLoading, setIsEnsembleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Mock Data Generators for Offline Mode
  const getOfflineStockData = (symbol: string): StockData => ({
    symbol: symbol,
    yahooSymbol: `${symbol}.NS`,
    companyName: `${symbol} India Ltd (Demo)`,
    currentPrice: 2450.00,
    previousClose: 2400.00,
    change: 50.00,
    changePercent: 2.08,
    volume: 1500000,
    volumeFormatted: "1.5M",
    marketCap: 15000000000,
    marketCapFormatted: "1.5T",
    currency: "INR",
    exchange: "NSE",
    timestamp: new Date().toISOString(),
    marketState: "REGULAR"
  });

  const getOfflineAiData = (symbol: string): AIPredictionData => ({
    symbol: symbol,
    timestamp: new Date().toISOString(),
    prediction: {
      direction: 'UP',
      trendLabel: 'Bullish',
      overallConfidence: 85,
      signalsAgree: true,
      signalsConflict: false,
      agreementStatus: 'agree'
    },
    technical: {
      direction: 'UP',
      trendLabel: 'Strong Buy',
      confidence: 88,
      weight: 'High',
      currentPrice: 2450.00,
      sma5Day: 2410.00,
      deviationPercent: 1.6
    },
    news: {
      sentimentLabel: 'Positive',
      sentimentDirection: 'UP',
      confidence: 70,
      weight: 'Medium',
      articlesAnalyzed: 15
    },
    explanation: [
      "Technical indicators show strong upward momentum.",
      "Positive news sentiment supports the bullish trend.",
      "Price is trading above key moving averages."
    ],
    logic: {
      rule1: "Price > SMA20",
      rule2: "RSI < 70 (Not Overbought)",
      rule3: "MACD > Signal Line",
      rule4: "Volume > Average"
    },
    disclaimer: "This is a demo prediction generated for offline mode."
  });

  const getOfflineAgenticData = (symbol: string): AgenticThesisData => ({
    bull_view: [
      "Steady revenue growth in core sectors indicates resilience.",
      "Strategic partnerships recently announced could boost market share.",
      "Technical indicators show a potential reversal from support levels."
    ],
    bear_view: [
      "Global macroeconomic headwinds may impact short-term margins.",
      "Rising debt levels in the recent quarter are a concern.",
      "Sector rotation suggests capital might flow to defensive assets."
    ],
    sentiment: 'Neutral',
    confidence_score: 78,
    reasoning: "While the company shows strong fundamental growth, external market risks and debt concerns warrant a cautious approach. The consensus leans towards a hold strategy until clearer signals emerge.",
    disclaimer: "This is a demo analysis generated for offline mode."
  });

  const getOfflineEnsembleData = (symbol: string, currentPrice: number): EnsembleData => ({
    ticker: symbol,
    current_price: currentPrice,
    lstm_base_price: currentPrice * 1.02,
    final_predicted_price: currentPrice * 1.015,
    factors: {
      quant_forecast_pct: 2.0,
      topology_risk_penalty_pct: -0.5,
      sentiment_multiplier: 1.0,
      sentiment: "Neutral"
    },
    confidence_score: 82
  });

  // Fetch all dashboard data
  const loadDashboardData = useCallback(async (symbol: string) => {
    setIsLoading(true);
    setError(null);
    setIsOfflineMode(false);

    try {
      // 1. Fetch live stock info
      const stock = await fetchStockData(symbol);
      setStockData(stock);

      // Update chart with new base price (simulation)
      setChartData(generateStockData(stock.currentPrice));

      // 2. Fetch AI prediction (News sentiment is fetched inside the component)
      const ai = await fetchAIPrediction(symbol);
      setAiData(ai);

      // 3. Fetch Agentic Thesis (Async/Independent)
      setIsAgenticLoading(true);
      fetchAgenticThesis(symbol)
        .then(data => setAgenticData(data))
        .catch(err => console.error("Agentic fetch failed", err))
        .finally(() => setIsAgenticLoading(false));

      // 4. Fetch Ensemble Prediction (Async/Independent)
      setIsEnsembleLoading(true);
      fetchEnsemblePrediction(symbol, stock.currentPrice)
        .then(data => setEnsembleData(data))
        .catch(err => console.error("Ensemble fetch failed", err))
        .finally(() => setIsEnsembleLoading(false));

    } catch (err) {
      console.warn("Dashboard data fetch failed (Backend might be offline):", err);
      // Fail gracefully to offline mode
      setIsOfflineMode(true);

      const offlineStock = getOfflineStockData(symbol);
      setStockData(offlineStock);
      setChartData(generateStockData(offlineStock.currentPrice));
      setAiData(getOfflineAiData(symbol));
      setAgenticData(getOfflineAgenticData(symbol));
      setEnsembleData(getOfflineEnsembleData(symbol, offlineStock.currentPrice));

      setEnsembleData(getOfflineEnsembleData(symbol, offlineStock.currentPrice));

      // We don't set 'error' state to avoid the red alert
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handler for Ensemble Shock Simulation
  const handleEnsembleRefresh = async (simulateShock: boolean = false) => {
    if (!selectedStock || !stockData?.currentPrice) return;

    setIsEnsembleLoading(true);
    try {
      const data = await fetchEnsemblePrediction(selectedStock, stockData.currentPrice, simulateShock);
      setEnsembleData(data);
    } catch (err) {
      console.error("Ensemble shock fetch failed", err);
      // Fallback if offline
      if (isOfflineMode && simulateShock) {
        const offline = getOfflineEnsembleData(selectedStock, stockData.currentPrice);
        offline.factors.topology_risk_penalty_pct -= 5.5; // Shock effect
        offline.final_predicted_price = offline.current_price * 0.95; // 5% drop
        offline.confidence_score = 40; // Panic drops confidence
        setEnsembleData(offline);
      }
    } finally {
      setIsEnsembleLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadDashboardData(selectedStock);
  }, [selectedStock, loadDashboardData]);

  const handleSearch = (ticker: string) => {
    setSelectedStock(ticker.toUpperCase());
  };

  return (
    <div className="min-h-screen text-zinc-100 p-6 relative">
      {/* Background Gradients (Optional enhancement for depth) */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[2rem] font-bold text-zinc-100 mb-2 tracking-tight">Stock Analytics Dashboard</h1>
          <p className="text-zinc-400 text-lg">Real-time NSE stock analysis with AI predictions</p>
        </div>

        {/* Stock Search */}
        <div className="relative z-10">
          <StockInput onSearch={handleSearch} disabled={isLoading} />
        </div>

        {/* Market Context */}
        <MarketContextStrip />

        {/* Offline Mode Indicator */}
        {isOfflineMode && (
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="size-5 shrink-0" />
            <div className="flex flex-col">
              <p className="text-sm font-medium text-amber-200">Live data temporarily unavailable</p>
              <p className="text-xs text-amber-500/80">System has switched to offline demo mode. Showing simulated data.</p>
            </div>
          </div>
        )}

        {/* Loading Overlay or Content */}
        {isLoading && !stockData ? (
          <div className="h-[400px] flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20">
            <Loader2 className="size-8 text-[#5B8DFF] animate-spin mb-4" />
            <p className="text-zinc-500">Fetching live market data...</p>
          </div>
        ) : stockData && (
          <>
            {/* Current Stock Info */}
            <div className="border-l-[6px] border-[#3A6FF8] bg-[rgba(15,23,42,0.4)] backdrop-blur-xl p-6 rounded-r-xl shadow-lg shadow-blue-900/5 flex items-center justify-between border-y border-r border-[#3A6FF8]/10">
              <div>
                <p className="text-sm text-zinc-400 font-medium uppercase tracking-wider mb-1">Currently Viewing</p>
                <div className="flex items-baseline gap-3">
                  <p className="text-3xl font-bold text-zinc-100">{stockData.symbol}</p>
                  <p className="text-sm text-zinc-500 hidden md:block">{stockData.companyName}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="p-2 rounded-lg bg-[#3A6FF8]/10 border border-[#3A6FF8]/20 inline-block mb-1">
                  <span className="text-xs font-mono text-[#5B8DFF]">NSE:EQ</span>
                </div>
                <p className="text-xs text-zinc-500">{stockData.marketState}</p>
              </div>
            </div>

            {/* Stock Metrics */}
            <StockMetrics
              currentPrice={stockData.currentPrice}
              change={stockData.change}
              changePercent={stockData.changePercent}
              volume={stockData.volumeFormatted}
              marketCap={stockData.marketCapFormatted}
            />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Top Row: AI Prediction & Chart (Chart takes more space) */}

              {/* Left: AI Prediction Card (High Priority Signal) */}
              <div className="lg:col-span-1 space-y-6">
                <AIPredictionCard
                  data={aiData}
                  isLoading={isLoading}
                />

                {/* Visual Disclaimer (New) */}
                <div className="p-4 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30 text-center">
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    <span className="text-[#3A6FF8] font-medium">Demo Mode:</span> Charts and metrics are simulated for demonstration.
                    Prediction confidence is illustrative.
                  </p>
                </div>
              </div>

              {/* Right: Chart (Primary Visualization) */}
              <div className="lg:col-span-2">
                <StockChart data={chartData} stockName={stockData.symbol} />
              </div>

              {/* Agentic Ensemble (New Section) */}
              <div className="lg:col-span-3 mt-4">
                <PredictionEnsembleCard
                  data={ensembleData}
                  isLoading={isEnsembleLoading}
                  ticker={selectedStock}
                  onRefresh={handleEnsembleRefresh}
                />
              </div>

              {/* Bottom Row: Secondary Analysis (Technical + News) */}
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">

                {/* Technical Sentiment (Secondary) */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider pl-1">Technical Signal</h3>
                  <div className="bg-[rgba(15,23,42,0.3)] p-1 rounded-2xl border border-white/5 h-full">
                    <SentimentIndicator
                      sentiment={
                        aiData?.prediction.direction === 'UP' ? 'positive' :
                          aiData?.prediction.direction === 'DOWN' ? 'negative' : 'neutral'
                      }
                    />
                    <div className="p-4 text-xs text-zinc-500">
                      Technical indicators suggest a momentum shift consistent with the AI prediction model.
                    </div>
                  </div>
                </div>

                {/* News Sentiment (Contextual/Low Weight) */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider pl-1 flex justify-between items-center">
                    <span>Market News Context</span>
                    <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">Low Weight Signal</span>
                  </h3>
                  <NewsSentiment symbol={selectedStock} />
                </div>

              </div>

              {/* Agentic Debate Section (Full Width) */}
              <div className="lg:col-span-3 mt-4">
                <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider pl-1 mb-3">Deep Dive Analysis</h3>
                <AgenticThesisCard data={agenticData} isLoading={isAgenticLoading} />
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-[rgba(100,150,255,0.1)]">
          <p className="text-center text-[10px] text-zinc-500 uppercase tracking-widest">
            QuantPulse India • AI-Powered Analytics • {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
