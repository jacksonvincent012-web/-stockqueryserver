import React, { useState, useMemo } from 'react';
import { 
  Database, Search, Filter, ChevronLeft, ChevronRight, CheckCircle2, 
  AlertTriangle, Clock, Globe, Plus, Download, Upload, RefreshCw, 
  Layers, ShieldCheck, Activity, Edit3, Trash2, Eye, MoreVertical, 
  Check, X, ArrowUpDown, SlidersHorizontal, Share2, Server, Terminal, 
  HelpCircle, FileSpreadsheet, Building2, Zap, Play, Pause, ExternalLink, 
  Info, AlertCircle, Sparkles, Sliders, ShieldAlert, CheckSquare, Square
} from 'lucide-react';

interface CompanyRecord {
  id: string;
  ticker: string;
  company: string;
  sector: string;
  country: string;
  exchange: string;
  price: string;
  status: 'Active' | 'Paused' | 'Offline';
  tradable: boolean;
  dataSource: string;
  lastSync: string;
  dateAdded: string;
  notes: string;
  logoColor: string;
}

interface MarketProvider {
  id: string;
  name: string;
  status: 'Connected' | 'Degrading' | 'Offline';
  lastSync: string;
  responseTime: string;
  recordsCount: string;
  endpoint: string;
  isRefreshing?: boolean;
}

interface ActivityLogItem {
  id: string;
  time: string;
  action: string;
  detail: string;
  type: 'add' | 'update' | 'enable' | 'disable' | 'refresh' | 'remove';
}

interface TickerControlViewProps {
  theme?: 'light' | 'dark';
}

export default function TickerControlView({ theme = 'dark' }: TickerControlViewProps) {
  const isLight = theme === 'light';

  // --- STATE: Company Directory ---
  const [companies, setCompanies] = useState<CompanyRecord[]>([
    { id: '1', ticker: 'AAPL', company: 'Apple Inc.', sector: 'Technology', country: 'USA', exchange: 'NASDAQ', price: '$228.40', status: 'Active', tradable: true, dataSource: 'Bloomberg Real-Time Feed', lastSync: 'Just now', dateAdded: 'Jan 12, 2024', notes: 'Primary S&P 500 tech bellwether. High liquidity global equity.', logoColor: 'bg-blue-600' },
    { id: '2', ticker: 'NVDA', company: 'NVIDIA Corporation', sector: 'Technology', country: 'USA', exchange: 'NASDAQ', price: '$128.40', status: 'Active', tradable: true, dataSource: 'NASDAQ TotalView API', lastSync: '1s ago', dateAdded: 'Jan 15, 2024', notes: 'AI semiconductor leader. High intraday trading volume.', logoColor: 'bg-emerald-600' },
    { id: '3', ticker: 'TSLA', company: 'Tesla, Inc.', sector: 'Automotive', country: 'USA', exchange: 'NASDAQ', price: '$248.10', status: 'Active', tradable: true, dataSource: 'Bloomberg Real-Time Feed', lastSync: '2s ago', dateAdded: 'Feb 02, 2024', notes: 'EV and clean energy storage manufacturer.', logoColor: 'bg-red-600' },
    { id: '4', ticker: 'MSFT', company: 'Microsoft Corporation', sector: 'Technology', country: 'USA', exchange: 'NASDAQ', price: '$448.10', status: 'Active', tradable: true, dataSource: 'Refinitiv Eikon Direct', lastSync: 'Just now', dateAdded: 'Jan 10, 2024', notes: 'Cloud computing and enterprise software provider.', logoColor: 'bg-cyan-600' },
    { id: '5', ticker: 'AMD', company: 'Advanced Micro Devices', sector: 'Technology', country: 'USA', exchange: 'NASDAQ', price: '$162.30', status: 'Active', tradable: true, dataSource: 'NASDAQ TotalView API', lastSync: '3s ago', dateAdded: 'Mar 11, 2024', notes: 'CPU and GPU processor manufacturer.', logoColor: 'bg-indigo-600' },
    { id: '6', ticker: 'AMZN', company: 'Amazon.com, Inc.', sector: 'Retail', country: 'USA', exchange: 'NASDAQ', price: '$198.20', status: 'Paused', tradable: false, dataSource: 'Bloomberg Real-Time Feed', lastSync: '12s ago', dateAdded: 'Jan 18, 2024', notes: 'E-commerce and cloud services giant. Currently paused for corporate action review.', logoColor: 'bg-amber-600' },
    { id: '7', ticker: 'GOOGL', company: 'Alphabet Inc.', sector: 'Technology', country: 'USA', exchange: 'NASDAQ', price: '$178.90', status: 'Active', tradable: true, dataSource: 'Refinitiv Eikon Direct', lastSync: 'Just now', dateAdded: 'Jan 14, 2024', notes: 'Search engine and digital advertising conglomerate.', logoColor: 'bg-blue-500' },
    { id: '8', ticker: 'META', company: 'Meta Platforms, Inc.', sector: 'Technology', country: 'USA', exchange: 'NASDAQ', price: '$512.40', status: 'Offline', tradable: false, dataSource: 'NASDAQ TotalView API', lastSync: '2m ago', dateAdded: 'Feb 19, 2024', notes: 'Social network and metaverse technology developer. Feed maintenance offline.', logoColor: 'bg-purple-600' },
    { id: '9', ticker: 'JPM', company: 'JPMorgan Chase & Co.', sector: 'Financials', country: 'USA', exchange: 'NYSE', price: '$204.50', status: 'Active', tradable: true, dataSource: 'NYSE Consolidated Tape', lastSync: '4s ago', dateAdded: 'Jan 22, 2024', notes: 'Global banking and financial services institution.', logoColor: 'bg-slate-700' },
    { id: '10', ticker: 'V', company: 'Visa Inc.', sector: 'Financials', country: 'USA', exchange: 'NYSE', price: '$275.10', status: 'Active', tradable: true, dataSource: 'NYSE Consolidated Tape', lastSync: '5s ago', dateAdded: 'Feb 05, 2024', notes: 'International electronic payments network.', logoColor: 'bg-blue-700' },
    { id: '11', ticker: 'JNJ', company: 'Johnson & Johnson', sector: 'Healthcare', country: 'USA', exchange: 'NYSE', price: '$152.80', status: 'Active', tradable: true, dataSource: 'Bloomberg Real-Time Feed', lastSync: '6s ago', dateAdded: 'Jan 30, 2024', notes: 'Pharmaceutical and medical technology developer.', logoColor: 'bg-rose-600' },
    { id: '12', ticker: 'XOM', company: 'Exxon Mobil Corp.', sector: 'Energy', country: 'USA', exchange: 'NYSE', price: '$114.20', status: 'Active', tradable: true, dataSource: 'NYSE Consolidated Tape', lastSync: '8s ago', dateAdded: 'Mar 01, 2024', notes: 'Multinational oil and gas exploration corporation.', logoColor: 'bg-red-700' },
    { id: '13', ticker: 'WMT', company: 'Walmart Inc.', sector: 'Retail', country: 'USA', exchange: 'NYSE', price: '$68.40', status: 'Active', tradable: true, dataSource: 'Refinitiv Eikon Direct', lastSync: '10s ago', dateAdded: 'Jan 25, 2024', notes: 'Global retail store and hypermarket operator.', logoColor: 'bg-sky-600' },
    { id: '14', ticker: 'UNH', company: 'UnitedHealth Group', sector: 'Healthcare', country: 'USA', exchange: 'NYSE', price: '$585.90', status: 'Active', tradable: true, dataSource: 'Bloomberg Real-Time Feed', lastSync: '15s ago', dateAdded: 'Feb 14, 2024', notes: 'Managed healthcare and insurance provider.', logoColor: 'bg-teal-600' },
    { id: '15', ticker: 'PG', company: 'Procter & Gamble Co.', sector: 'Consumer Goods', country: 'USA', exchange: 'NYSE', price: '$168.20', status: 'Active', tradable: true, dataSource: 'NYSE Consolidated Tape', lastSync: '18s ago', dateAdded: 'Mar 04, 2024', notes: 'Consumer packaged goods manufacturer.', logoColor: 'bg-indigo-700' },
    { id: '16', ticker: 'SAP', company: 'SAP SE', sector: 'Technology', country: 'Germany', exchange: 'XETRA', price: '€194.50', status: 'Active', tradable: true, dataSource: 'Refinitiv Eikon Direct', lastSync: '5s ago', dateAdded: 'Apr 10, 2024', notes: 'European enterprise software and ERP system provider.', logoColor: 'bg-blue-800' },
    { id: '17', ticker: 'RY', company: 'Royal Bank of Canada', sector: 'Financials', country: 'Canada', exchange: 'TSX', price: 'CA$148.20', status: 'Active', tradable: true, dataSource: 'Bloomberg Real-Time Feed', lastSync: '7s ago', dateAdded: 'Apr 15, 2024', notes: 'Canadian financial services and wealth management firm.', logoColor: 'bg-amber-700' },
    { id: '18', ticker: 'TM', company: 'Toyota Motor Corp.', sector: 'Automotive', country: 'Japan', exchange: 'TYO', price: '¥2,840.0', status: 'Active', tradable: true, dataSource: 'Polygon.io WebSocket', lastSync: '3s ago', dateAdded: 'May 02, 2024', notes: 'Global automobile manufacturer.', logoColor: 'bg-red-800' },
    { id: '19', ticker: 'AZN', company: 'AstraZeneca PLC', sector: 'Healthcare', country: 'UK', exchange: 'LSE', price: '£12,450.0', status: 'Active', tradable: true, dataSource: 'Refinitiv Eikon Direct', lastSync: '9s ago', dateAdded: 'May 18, 2024', notes: 'British-Swedish biopharmaceutical company.', logoColor: 'bg-emerald-700' },
    { id: '20', ticker: 'ASML', company: 'ASML Holding N.V.', sector: 'Technology', country: 'Netherlands', exchange: 'Euronext', price: '€920.40', status: 'Active', tradable: true, dataSource: 'Bloomberg Real-Time Feed', lastSync: '4s ago', dateAdded: 'Jun 01, 2024', notes: 'Photolithography systems manufacturer for chipmakers.', logoColor: 'bg-cyan-700' },
  ]);

  // --- STATE: Market Data Providers ---
  const [providers, setProviders] = useState<MarketProvider[]>([
    { id: 'bbg', name: 'Bloomberg Real-Time Feed', status: 'Connected', lastSync: 'Just now', responseTime: '11 ms', recordsCount: '12,450 symbols', endpoint: 'feed.bloomberg.internal:8443' },
    { id: 'ref', name: 'Refinitiv Eikon Direct', status: 'Connected', lastSync: '2 seconds ago', responseTime: '14 ms', recordsCount: '8,920 symbols', endpoint: 'api.refinitiv.com/v3/stream' },
    { id: 'nasdaq', name: 'NASDAQ TotalView API', status: 'Connected', lastSync: '1 second ago', responseTime: '7 ms', recordsCount: '4,100 symbols', endpoint: 'direct.nasdaq.com/itch-feed' },
    { id: 'nyse', name: 'NYSE Consolidated Tape', status: 'Connected', lastSync: '4 seconds ago', responseTime: '16 ms', recordsCount: '3,850 symbols', endpoint: 'tape.nyse.com/socket/v1' },
    { id: 'poly', name: 'Polygon.io WebSocket Stream', status: 'Degrading', lastSync: '18 seconds ago', responseTime: '42 ms', recordsCount: '15,200 symbols', endpoint: 'socket.polygon.io/cluster-2' },
  ]);

  // --- STATE: Activity Logs ---
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([
    { id: 'log-101', time: 'Just now', action: 'Market Data Refreshed', detail: 'Bloomberg Real-Time Feed automated directory sync completed', type: 'refresh' },
    { id: 'log-102', time: '14 mins ago', action: 'Company Updated', detail: 'NVIDIA Corporation (NVDA) notes updated by administrator', type: 'update' },
    { id: 'log-103', time: '1 hour ago', action: 'Trading Enabled', detail: 'Arm Holdings (ARM) trading status set to Active', type: 'enable' },
    { id: 'log-104', time: '3 hours ago', action: 'Company Added', detail: 'Reddit, Inc. (RDDT) added to NASDAQ directory', type: 'add' },
    { id: 'log-105', time: 'Yesterday', action: 'Trading Disabled', detail: 'Amazon.com, Inc. (AMZN) paused for corporate review', type: 'disable' },
    { id: 'log-106', time: '2 days ago', action: 'Company Removed', detail: 'Legacy Ticker (OLD) removed from directory catalog', type: 'remove' },
  ]);

  // --- STATE: Search, Filters & Pagination ---
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('ALL');
  const [exchangeFilter, setExchangeFilter] = useState('ALL');
  const [countryFilter, setCountryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [tradableOnly, setTradableOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // --- STATE: Modals & Panels ---
  const [selectedCompany, setSelectedCompany] = useState<CompanyRecord | null>(null);
  const [editingCompany, setEditingCompany] = useState<CompanyRecord | null>(null);
  const [assigningSectorFor, setAssigningSectorFor] = useState<CompanyRecord | null>(null);
  const [assigningExchangeFor, setAssigningExchangeFor] = useState<CompanyRecord | null>(null);
  const [isAddingCompany, setIsAddingCompany] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
  // --- STATE: Loading & Toast Indicators ---
  const [isRebuildingIndex, setIsRebuildingIndex] = useState(false);
  const [isRefreshingGlobal, setIsRefreshingGlobal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // --- STATE: Form inputs for editing/adding ---
  const [formName, setFormName] = useState('');
  const [formTicker, setFormTicker] = useState('');
  const [formSector, setFormSector] = useState('Technology');
  const [formCountry, setFormCountry] = useState('USA');
  const [formExchange, setFormExchange] = useState('NASDAQ');
  const [formTradable, setFormTradable] = useState(true);
  const [formNotes, setFormNotes] = useState('');
  const [formSource, setFormSource] = useState('Bloomberg Real-Time Feed');

  // --- Helper: Add Activity Log ---
  const addLog = (action: string, detail: string, type: ActivityLogItem['type']) => {
    const newLog: ActivityLogItem = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      time: 'Just now',
      action,
      detail,
      type
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  // --- Helper: Show Toast ---
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 4000);
  };

  // --- Filter Options ---
  const sectors = useMemo(() => ['ALL', 'Technology', 'Automotive', 'Financials', 'Healthcare', 'Consumer Goods', 'Energy', 'Retail'], []);
  const exchanges = useMemo(() => ['ALL', 'NASDAQ', 'NYSE', 'XETRA', 'TSX', 'TYO', 'LSE', 'Euronext'], []);
  const countries = useMemo(() => ['ALL', 'USA', 'Germany', 'Canada', 'Japan', 'UK', 'Netherlands'], []);
  const statuses = useMemo(() => ['ALL', 'Active', 'Paused', 'Offline'], []);

  // --- SMART SEARCH & FILTERING ---
  const filteredCompanies = useMemo(() => {
    const query = search.trim().toLowerCase();

    return companies
      .map(item => {
        let score = 0;
        if (!query) {
          score = 1; // No search query: keep all
        } else {
          const tickerLow = item.ticker.toLowerCase();
          const nameLow = item.company.toLowerCase();
          const sectorLow = item.sector.toLowerCase();
          const countryLow = item.country.toLowerCase();
          const exchangeLow = item.exchange.toLowerCase();

          // Prioritize exact matches
          if (tickerLow === query || nameLow === query) {
            score = 100;
          } 
          // Names/tickers starting with typed letters
          else if (tickerLow.startsWith(query)) {
            score = 80;
          } else if (nameLow.startsWith(query)) {
            score = 70;
          } 
          // Word boundary match or category prefix match
          else if (
            nameLow.includes(' ' + query) || 
            sectorLow.startsWith(query) || 
            exchangeLow.startsWith(query) || 
            countryLow.startsWith(query)
          ) {
            score = 50;
          } 
          // Close match / contains substring anywhere
          else if (
            tickerLow.includes(query) || 
            nameLow.includes(query) || 
            sectorLow.includes(query) || 
            countryLow.includes(query)
          ) {
            score = 30;
          }
        }

        return { item, score };
      })
      .filter(({ item, score }) => {
        if (score === 0) return false;
        if (sectorFilter !== 'ALL' && item.sector !== sectorFilter) return false;
        if (exchangeFilter !== 'ALL' && item.exchange !== exchangeFilter) return false;
        if (countryFilter !== 'ALL' && item.country !== countryFilter) return false;
        if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
        if (tradableOnly && !item.tradable) return false;
        return true;
      })
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.item.ticker.localeCompare(b.item.ticker);
      })
      .map(({ item }) => item);
  }, [companies, search, sectorFilter, exchangeFilter, countryFilter, statusFilter, tradableOnly]);

  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage) || 1;
  const paginatedCompanies = filteredCompanies.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // --- ACTIONS ---
  const handleToggleTradable = (company: CompanyRecord, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newTradable = !company.tradable;
    const newStatus = newTradable ? 'Active' : 'Paused';

    setCompanies(prev => prev.map(c => c.id === company.id ? { ...c, tradable: newTradable, status: newStatus, lastSync: 'Just now' } : c));
    if (selectedCompany && selectedCompany.id === company.id) {
      setSelectedCompany({ ...selectedCompany, tradable: newTradable, status: newStatus, lastSync: 'Just now' });
    }

    const actionText = newTradable ? 'Trading Enabled' : 'Trading Disabled';
    const detailText = `${company.company} (${company.ticker}) trading status set to ${newTradable ? 'Tradable (Active)' : 'Disabled (Paused)'}`;
    addLog(actionText, detailText, newTradable ? 'enable' : 'disable');
    showToast(`${actionText}: ${company.ticker}`);
  };

  const handleOpenEdit = (company: CompanyRecord, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingCompany(company);
    setFormName(company.company);
    setFormSector(company.sector);
    setFormCountry(company.country);
    setFormExchange(company.exchange);
    setFormTradable(company.tradable);
    setFormNotes(company.notes || '');
  };

  const handleSaveEdit = () => {
    if (!editingCompany) return;
    const updatedStatus = formTradable ? (editingCompany.status === 'Offline' ? 'Active' : editingCompany.status) : 'Paused';
    
    setCompanies(prev => prev.map(c => c.id === editingCompany.id ? {
      ...c,
      company: formName,
      sector: formSector,
      country: formCountry,
      exchange: formExchange,
      tradable: formTradable,
      status: updatedStatus,
      notes: formNotes,
      lastSync: 'Just now'
    } : c));

    if (selectedCompany && selectedCompany.id === editingCompany.id) {
      setSelectedCompany({
        ...selectedCompany,
        company: formName,
        sector: formSector,
        country: formCountry,
        exchange: formExchange,
        tradable: formTradable,
        status: updatedStatus,
        notes: formNotes,
        lastSync: 'Just now'
      });
    }

    addLog('Company Updated', `${formName} (${editingCompany.ticker}) information updated by administrator`, 'update');
    showToast(`Saved changes for ${editingCompany.ticker}`);
    setEditingCompany(null);
  };

  const handleOpenAdd = () => {
    setFormTicker('');
    setFormName('');
    setFormSector('Technology');
    setFormCountry('USA');
    setFormExchange('NASDAQ');
    setFormTradable(true);
    setFormNotes('');
    setFormSource('Bloomberg Real-Time Feed');
    setIsAddingCompany(true);
  };

  const handleSaveNewCompany = () => {
    if (!formTicker.trim() || !formName.trim()) {
      alert('Please provide both Stock Symbol (Ticker) and Company Name.');
      return;
    }
    const cleanTicker = formTicker.trim().toUpperCase();
    const newCompany: CompanyRecord = {
      id: `comp-${Date.now()}`,
      ticker: cleanTicker,
      company: formName.trim(),
      sector: formSector,
      country: formCountry,
      exchange: formExchange,
      price: '$100.00 (Pending Feed)',
      status: formTradable ? 'Active' : 'Paused',
      tradable: formTradable,
      dataSource: formSource,
      lastSync: 'Just now',
      dateAdded: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      notes: formNotes.trim() || 'New company listing added via Admin Console.',
      logoColor: 'bg-blue-600'
    };

    setCompanies(prev => [newCompany, ...prev]);
    addLog('Company Added', `${newCompany.company} (${cleanTicker}) added to platform directory under ${formExchange}`, 'add');
    showToast(`Added company: ${cleanTicker}`);
    setIsAddingCompany(false);
  };

  const handleRemoveCompany = (company: CompanyRecord, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm(`Are you sure you want to remove ${company.company} (${company.ticker}) from the platform directory?`)) {
      setCompanies(prev => prev.filter(c => c.id !== company.id));
      if (selectedCompany && selectedCompany.id === company.id) setSelectedCompany(null);
      addLog('Company Removed', `${company.company} (${company.ticker}) removed from platform directory`, 'remove');
      showToast(`Removed ${company.ticker} from platform`);
    }
  };

  const handleAssignSector = (company: CompanyRecord, newSector: string) => {
    setCompanies(prev => prev.map(c => c.id === company.id ? { ...c, sector: newSector, lastSync: 'Just now' } : c));
    if (selectedCompany && selectedCompany.id === company.id) {
      setSelectedCompany({ ...selectedCompany, sector: newSector });
    }
    addLog('Company Updated', `${company.ticker} sector assigned to ${newSector}`, 'update');
    showToast(`${company.ticker} sector set to ${newSector}`);
    setAssigningSectorFor(null);
  };

  const handleAssignExchange = (company: CompanyRecord, newExchange: string) => {
    setCompanies(prev => prev.map(c => c.id === company.id ? { ...c, exchange: newExchange, lastSync: 'Just now' } : c));
    if (selectedCompany && selectedCompany.id === company.id) {
      setSelectedCompany({ ...selectedCompany, exchange: newExchange });
    }
    addLog('Company Updated', `${company.ticker} exchange assigned to ${newExchange}`, 'update');
    showToast(`${company.ticker} exchange set to ${newExchange}`);
    setAssigningExchangeFor(null);
  };

  const handleRefreshProvider = (providerId: string) => {
    setProviders(prev => prev.map(p => p.id === providerId ? { ...p, isRefreshing: true } : p));
    setTimeout(() => {
      setProviders(prev => prev.map(p => {
        if (p.id === providerId) {
          return { ...p, status: 'Connected', lastSync: 'Just now', responseTime: `${Math.floor(Math.random() * 10) + 7} ms`, isRefreshing: false };
        }
        return p;
      }));
      const prov = providers.find(p => p.id === providerId);
      addLog('Market Data Refreshed', `${prov?.name || 'Data Provider'} sync initiated and verified`, 'refresh');
      showToast(`Refreshed ${prov?.name || 'data provider'}`);
    }, 800);
  };

  const handleReconnectProvider = (providerId: string) => {
    setProviders(prev => prev.map(p => p.id === providerId ? { ...p, isRefreshing: true } : p));
    setTimeout(() => {
      setProviders(prev => prev.map(p => {
        if (p.id === providerId) {
          return { ...p, status: 'Connected', lastSync: 'Just now', responseTime: '12 ms', isRefreshing: false };
        }
        return p;
      }));
      const prov = providers.find(p => p.id === providerId);
      addLog('Market Data Refreshed', `Connection restored for ${prov?.name || 'Data Provider'}`, 'refresh');
      showToast(`Reconnected to ${prov?.name || 'provider'}`);
    }, 1000);
  };

  const handleGlobalRefresh = () => {
    setIsRefreshingGlobal(true);
    setTimeout(() => {
      setIsRefreshingGlobal(false);
      setProviders(prev => prev.map(p => ({ ...p, status: 'Connected', lastSync: 'Just now', responseTime: `${Math.floor(Math.random() * 8) + 8} ms` })));
      setCompanies(prev => prev.map(c => ({ ...c, lastSync: 'Just now' })));
      addLog('Market Data Refreshed', 'Global market directory data synchronization completed across all providers', 'refresh');
      showToast('Global market data synchronized');
    }, 1200);
  };

  const handleRebuildIndex = () => {
    setIsRebuildingIndex(true);
    setTimeout(() => {
      setIsRebuildingIndex(false);
      addLog('Company Updated', 'Global market directory search and sector index rebuilt in 38 ms', 'update');
      showToast('Search index rebuilt and optimized');
    }, 1000);
  };

  const handleSimulateImport = (presetName: string) => {
    const newItems: CompanyRecord[] = [
      { id: `imp-1-${Date.now()}`, ticker: 'ARM', company: 'Arm Holdings plc', sector: 'Technology', country: 'UK', exchange: 'NASDAQ', price: '$134.20', status: 'Active', tradable: true, dataSource: 'Bloomberg Real-Time Feed', lastSync: 'Just now', dateAdded: 'Today', notes: 'Semiconductor architecture designer.', logoColor: 'bg-indigo-600' },
      { id: `imp-2-${Date.now()}`, ticker: 'RDDT', company: 'Reddit, Inc.', sector: 'Technology', country: 'USA', exchange: 'NYSE', price: '$64.80', status: 'Active', tradable: true, dataSource: 'NYSE Consolidated Tape', lastSync: 'Just now', dateAdded: 'Today', notes: 'Community forum and discussion platform.', logoColor: 'bg-orange-600' },
      { id: `imp-3-${Date.now()}`, ticker: 'SONY', company: 'Sony Group Corp.', sector: 'Consumer Goods', country: 'Japan', exchange: 'NYSE', price: '$86.10', status: 'Active', tradable: true, dataSource: 'Refinitiv Eikon Direct', lastSync: 'Just now', dateAdded: 'Today', notes: 'Electronics, gaming, and entertainment conglomerate.', logoColor: 'bg-blue-600' }
    ];
    setCompanies(prev => [...newItems, ...prev]);
    addLog('Company Added', `Imported ${newItems.length} companies from "${presetName}" preset`, 'add');
    showToast(`Imported 3 new companies into directory`);
    setIsImporting(false);
  };

  const handleExportDirectory = () => {
    const jsonStr = JSON.stringify(companies, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `market-directory-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    addLog('Company Updated', 'Administrator exported market directory records to local file', 'update');
    showToast('Exported market directory JSON');
  };

  const scrollToActivityLog = () => {
    const el = document.getElementById('admin-activity-history-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // --- STATS CALCULATIONS ---
  const totalCompaniesCount = companies.length;
  const activeCompaniesCount = companies.filter(c => c.status === 'Active' && c.tradable).length;
  const connectedExchangesCount = new Set(companies.map(c => c.exchange)).size;
  const lastUpdateLabel = 'Just now (Auto-sync)';

  // --- STYLES FOR THEMES ---
  const bgCard = isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800 shadow-xl';
  const bgHeader = isLight ? 'bg-slate-900 text-white' : 'bg-slate-950 border-slate-800 text-white';
  const textPrimary = isLight ? 'text-slate-900' : 'text-white';
  const textSecondary = isLight ? 'text-slate-600' : 'text-slate-400';
  const textMuted = isLight ? 'text-slate-400' : 'text-slate-500';
  const tableHeaderBg = isLight ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-950/80 text-slate-400 border-slate-800';
  const tableRowHover = isLight ? 'hover:bg-blue-50/50' : 'hover:bg-slate-800/50';
  const inputBg = isLight ? 'bg-white border-slate-300 text-slate-900 focus:border-blue-500' : 'bg-slate-950 border-slate-800 text-white focus:border-blue-500';

  return (
    <div className={`space-y-8 font-sans ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-blue-400 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 hover:bg-blue-700 p-1 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Rebuilding Banner */}
      {isRebuildingIndex && (
        <div className="bg-blue-600/20 border border-blue-500/30 rounded-2xl p-4 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
            <div>
              <h4 className="text-sm font-bold text-blue-400">Rebuilding Global Search & Sector Index...</h4>
              <p className="text-xs text-slate-400">Optimizing trie structures and symbol lookups across connected exchanges.</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-blue-300 bg-blue-500/20 px-3 py-1 rounded-lg">IN PROGRESS</span>
        </div>
      )}

      {/* Header Banner */}
      <div className={`${bgHeader} p-6 sm:p-8 rounded-2xl border shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10">
          <div className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2 mb-2">
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span>PLATFORM ADMINISTRATION CONSOLE • DIRECTORY SERVICES</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Market Directory
          </h1>
          <p className="text-sm text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
            Manage companies, exchanges, sectors, and live data provider connections across the platform. 
            <span className="text-blue-300 font-semibold ml-1">Live stock prices and market valuations are read-only and automatically updated by connected market feeds.</span>
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <button
            onClick={handleGlobalRefresh}
            disabled={isRefreshingGlobal}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-white transition-all flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingGlobal ? 'animate-spin text-blue-400' : ''}`} />
            <span>{isRefreshingGlobal ? 'Syncing Feeds...' : 'Refresh All Feeds'}</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Company</span>
          </button>
        </div>
      </div>

      {/* Read-Only Price Governance Notice */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3.5">
        <ShieldAlert className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-200/90 leading-relaxed">
          <strong className="text-amber-400 font-bold uppercase tracking-wider block mb-0.5">Enterprise Governance Rule: Read-Only Market Pricing</strong>
          The purpose of this administration console is to manage platform directory records, exchange classifications, sector mappings, and data provider connections. To maintain regulatory integrity, administrators cannot manually edit or override live stock prices or market movements.
        </div>
      </div>

      {/* TOP SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Companies */}
        <div className={`${bgCard} p-5 rounded-2xl border flex items-center justify-between`}>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Companies</div>
            <div className={`text-2xl font-black ${textPrimary}`}>{totalCompaniesCount}</div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <Building2 className="w-3 h-3 text-blue-500" />
              <span>Registered in platform catalog</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 font-bold">
            <Database className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Active Companies */}
        <div className={`${bgCard} p-5 rounded-2xl border flex items-center justify-between`}>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Active Companies</div>
            <div className={`text-2xl font-black text-emerald-500`}>{activeCompaniesCount}</div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <span>Tradable & receiving live quotes</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold">
            <CheckSquare className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Connected Exchanges */}
        <div className={`${bgCard} p-5 rounded-2xl border flex items-center justify-between`}>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Connected Exchanges</div>
            <div className={`text-2xl font-black text-blue-500`}>{connectedExchangesCount}</div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <Globe className="w-3 h-3 text-blue-500" />
              <span>NASDAQ, NYSE, XETRA, TSX, TYO, LSE</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 font-bold">
            <SlidersHorizontal className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Last Data Update */}
        <div className={`${bgCard} p-5 rounded-2xl border flex items-center justify-between`}>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Last Data Update</div>
            <div className={`text-lg font-black ${textPrimary} truncate max-w-[150px]`}>{lastUpdateLabel}</div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-emerald-500 animate-pulse" />
              <span>5 redundant feeds active</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 font-bold">
            <Activity className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* SMART SEARCH & FILTERS SECTION */}
      <div className={`${bgCard} p-6 rounded-2xl border space-y-4`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className={`text-base font-bold ${textPrimary} flex items-center gap-2`}>
              <Search className="w-4 h-4 text-blue-500" />
              <span>Smart Directory Search & Filters</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Search by Company Name, Stock Symbol, Sector, Country, or Exchange. Prioritizes exact and starting matches instantly.
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-mono">MATCHES FOUND:</span>
            <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-500 font-bold border border-blue-500/20">
              {filteredCompanies.length} of {companies.length}
            </span>
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Type Company Name (e.g., Apple), Symbol (e.g., AAPL), Sector, Country, or Exchange..."
            className={`w-full pl-11 pr-10 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-medium ${inputBg}`}
          />
          {search && (
            <button
              onClick={() => { setSearch(''); setCurrentPage(1); }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Simple Filters Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
          {/* Sector Filter */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Sector</label>
            <select
              value={sectorFilter}
              onChange={(e) => { setSectorFilter(e.target.value); setCurrentPage(1); }}
              className={`w-full rounded-xl px-3 py-2 text-xs font-medium border cursor-pointer focus:outline-none focus:border-blue-500 ${inputBg}`}
            >
              {sectors.map(s => <option key={s} value={s}>{s === 'ALL' ? 'All Sectors' : s}</option>)}
            </select>
          </div>

          {/* Exchange Filter */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Exchange</label>
            <select
              value={exchangeFilter}
              onChange={(e) => { setExchangeFilter(e.target.value); setCurrentPage(1); }}
              className={`w-full rounded-xl px-3 py-2 text-xs font-medium border cursor-pointer focus:outline-none focus:border-blue-500 ${inputBg}`}
            >
              {exchanges.map(e => <option key={e} value={e}>{e === 'ALL' ? 'All Exchanges' : e}</option>)}
            </select>
          </div>

          {/* Country Filter */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Country</label>
            <select
              value={countryFilter}
              onChange={(e) => { setCountryFilter(e.target.value); setCurrentPage(1); }}
              className={`w-full rounded-xl px-3 py-2 text-xs font-medium border cursor-pointer focus:outline-none focus:border-blue-500 ${inputBg}`}
            >
              {countries.map(c => <option key={c} value={c}>{c === 'ALL' ? 'All Countries' : c}</option>)}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className={`w-full rounded-xl px-3 py-2 text-xs font-medium border cursor-pointer focus:outline-none focus:border-blue-500 ${inputBg}`}
            >
              {statuses.map(s => <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s}</option>)}
            </select>
          </div>

          {/* Tradable Only Toggle */}
          <div className="flex flex-col justify-end">
            <label 
              onClick={() => { setTradableOnly(prev => !prev); setCurrentPage(1); }}
              className={`flex items-center justify-between px-3 py-2 rounded-xl border cursor-pointer select-none transition-colors ${
                tradableOnly ? 'bg-blue-600/10 border-blue-500 text-blue-400 font-bold' : `${inputBg} text-slate-400`
              }`}
            >
              <span className="text-xs">Tradable Only</span>
              {tradableOnly ? <CheckSquare className="w-4 h-4 text-blue-500" /> : <Square className="w-4 h-4 text-slate-500" />}
            </label>
          </div>
        </div>

        {/* Reset Filters Bar */}
        {(search || sectorFilter !== 'ALL' || exchangeFilter !== 'ALL' || countryFilter !== 'ALL' || statusFilter !== 'ALL' || tradableOnly) && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
            <span className="text-slate-400">Active filters filtering the directory catalog.</span>
            <button
              onClick={() => {
                setSearch('');
                setSectorFilter('ALL');
                setExchangeFilter('ALL');
                setCountryFilter('ALL');
                setStatusFilter('ALL');
                setTradableOnly(false);
                setCurrentPage(1);
              }}
              className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset All Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* COMPANY LIST TABLE */}
      <div className={`${bgCard} rounded-2xl border overflow-hidden`}>
        <div className="p-5 border-b border-slate-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className={`text-base font-bold ${textPrimary}`}>Company Directory List</h3>
            <p className="text-xs text-slate-400">Click any company row to inspect administrative details, data sources, and governance notes.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">VIEWING PAGE {currentPage} OF {totalPages}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans text-xs">
            <thead>
              <tr className={`${tableHeaderBg} uppercase text-[10px] tracking-wider font-bold`}>
                <th className="py-3.5 px-6">Company</th>
                <th className="py-3.5 px-4 font-mono">Symbol</th>
                <th className="py-3.5 px-4">Sector</th>
                <th className="py-3.5 px-4">Country</th>
                <th className="py-3.5 px-4">Exchange</th>
                <th className="py-3.5 px-4 text-right font-mono">Live Price (Read-Only)</th>
                <th className="py-3.5 px-4 text-center">Market Status</th>
                <th className="py-3.5 px-4">Last Updated</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-slate-800/60'}`}>
              {paginatedCompanies.length > 0 ? (
                paginatedCompanies.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => setSelectedCompany(row)}
                    className={`${tableRowHover} transition-colors cursor-pointer group`}
                  >
                    {/* Company Logo + Name */}
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl ${row.logoColor} text-white font-bold flex items-center justify-center text-xs flex-shrink-0 shadow-sm`}>
                          {row.ticker.substring(0, 2)}
                        </div>
                        <div>
                          <div className={`font-bold text-sm ${textPrimary} group-hover:text-blue-400 transition-colors`}>{row.company}</div>
                          <div className="text-[11px] text-slate-400 truncate max-w-[180px]">{row.notes || 'No administrative notes'}</div>
                        </div>
                      </div>
                    </td>

                    {/* Stock Symbol */}
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-500 text-sm">
                      {row.ticker}
                    </td>

                    {/* Sector with quick assign popover trigger */}
                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-300 font-medium">{row.sector}</span>
                        <button
                          onClick={() => setAssigningSectorFor(row)}
                          title="Assign Sector"
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-blue-400 transition-all"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    {/* Country */}
                    <td className="py-3.5 px-4 text-slate-300 font-medium">
                      {row.country}
                    </td>

                    {/* Exchange with quick assign popover trigger */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-300" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200">{row.exchange}</span>
                        <button
                          onClick={() => setAssigningExchangeFor(row)}
                          title="Assign Exchange"
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-blue-400 transition-all"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    {/* Live Price (Read-Only badge) */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-sm text-slate-200">
                      <span>{row.price}</span>
                      <span className="text-[9px] text-slate-500 block font-sans">Feed Sync</span>
                    </td>

                    {/* Market Status & Tradable */}
                    <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex flex-col items-center gap-1">
                        <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border inline-block ${
                          row.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          row.status === 'Paused' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {row.status}
                        </span>
                        <span className={`text-[10px] font-semibold ${row.tradable ? 'text-emerald-400' : 'text-slate-500'}`}>
                          {row.tradable ? 'Tradable: YES' : 'Tradable: NO'}
                        </span>
                      </div>
                    </td>

                    {/* Last Updated */}
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {row.lastSync}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedCompany(row)}
                          title="View Details"
                          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(row)}
                          title="Edit Information"
                          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleTradable(row)}
                          title={row.tradable ? 'Disable Trading' : 'Enable Trading'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            row.tradable ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                          }`}
                        >
                          <Sliders className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRemoveCompany(row)}
                          title="Remove from Platform"
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <AlertCircle className="w-8 h-8 text-slate-600" />
                      <div className="font-bold text-sm text-slate-400">No company directory records found</div>
                      <p className="text-xs max-w-sm">Try adjusting your search criteria or resetting the active sector and exchange filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-slate-950/40 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
          <div className="text-slate-400">
            Showing <strong className="text-white font-bold">{(currentPage - 1) * itemsPerPage + 1}</strong> to <strong className="text-white font-bold">{Math.min(currentPage * itemsPerPage, filteredCompanies.length)}</strong> of <strong className="text-white font-bold">{filteredCompanies.length}</strong> companies
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            <span className="px-3 py-1 text-slate-400">
              Page <strong className="text-white font-bold">{currentPage}</strong> of <strong className="text-white font-bold">{totalPages}</strong>
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* SECTION: MARKET DATA SOURCES (MARKET CONNECTIONS) */}
      <div className={`${bgCard} p-6 rounded-2xl border space-y-5`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/60 pb-4">
          <div>
            <h2 className={`text-base font-bold ${textPrimary} flex items-center gap-2`}>
              <Server className="w-5 h-5 text-emerald-500" />
              <span>Market Connections</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Connected market data providers transmitting live pricing, order book depth, and trade execution telemetry.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>ALL CONNECTED FEEDS HEALTHY</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {providers.map((prov) => (
            <div key={prov.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-sm text-white flex items-center gap-2">
                    <span>{prov.name}</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 mt-0.5 truncate">{prov.endpoint}</div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono border ${
                  prov.status === 'Connected' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  prov.status === 'Degrading' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                  'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}>
                  {prov.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 py-2 border-y border-slate-800/50 text-xs">
                <div>
                  <div className="text-[10px] uppercase text-slate-500 font-semibold">Last Sync Time</div>
                  <div className="font-mono font-bold text-slate-200 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-blue-400" />
                    <span>{prov.lastSync}</span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-slate-500 font-semibold">Response Time</div>
                  <div className="font-mono font-bold text-emerald-400 mt-0.5 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>{prov.responseTime}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => handleRefreshProvider(prov.id)}
                  disabled={prov.isRefreshing}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${prov.isRefreshing ? 'animate-spin' : ''}`} />
                  <span>{prov.isRefreshing ? 'Syncing...' : 'Refresh Data'}</span>
                </button>
                <button
                  onClick={() => handleReconnectProvider(prov.id)}
                  disabled={prov.isRefreshing}
                  className="py-1.5 px-3 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Reconnect</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION: PLATFORM MANAGEMENT TOOLS */}
      <div className={`${bgCard} p-6 rounded-2xl border space-y-5`}>
        <div className="border-b border-slate-800/60 pb-4">
          <h2 className={`text-base font-bold ${textPrimary} flex items-center gap-2`}>
            <Sliders className="w-5 h-5 text-purple-500" />
            <span>Platform Management Tools</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Administrative controls for catalog bulk operations, search indexing, and market feed synchronization.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: Add New Company */}
          <div onClick={handleOpenAdd} className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 hover:border-blue-500/50 transition-all cursor-pointer group flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 font-bold flex-shrink-0 group-hover:scale-110 transition-transform">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors">Add New Company</div>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">Register a new company ticker, sector mapping, and exchange connection.</p>
            </div>
          </div>

          {/* Card 2: Import Company List */}
          <div onClick={() => setIsImporting(true)} className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 hover:border-emerald-500/50 transition-all cursor-pointer group flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold flex-shrink-0 group-hover:scale-110 transition-transform">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors">Import Company List</div>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">Batch import company catalogs and ticker records from presets or structured files.</p>
            </div>
          </div>

          {/* Card 3: Export Company List */}
          <div onClick={handleExportDirectory} className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 hover:border-purple-500/50 transition-all cursor-pointer group flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 font-bold flex-shrink-0 group-hover:scale-110 transition-transform">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-white group-hover:text-purple-400 transition-colors">Export Company List</div>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">Download the full platform market directory catalog as a formatted JSON snapshot.</p>
            </div>
          </div>

          {/* Card 4: Refresh Market Data */}
          <div onClick={handleGlobalRefresh} className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 hover:border-cyan-500/50 transition-all cursor-pointer group flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500 font-bold flex-shrink-0 group-hover:scale-110 transition-transform">
              <RefreshCw className={`w-5 h-5 ${isRefreshingGlobal ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <div className="font-bold text-sm text-white group-hover:text-cyan-400 transition-colors">Refresh Market Data</div>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">Trigger immediate synchronization across all connected exchange feeds.</p>
            </div>
          </div>

          {/* Card 5: Rebuild Search Index */}
          <div onClick={handleRebuildIndex} className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 hover:border-amber-500/50 transition-all cursor-pointer group flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 font-bold flex-shrink-0 group-hover:scale-110 transition-transform">
              <Sparkles className={`w-5 h-5 ${isRebuildingIndex ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <div className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors">Rebuild Search Index</div>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">Optimize directory trie structures and symbol autocomplete lookups.</p>
            </div>
          </div>

          {/* Card 6: View Activity Log */}
          <div onClick={scrollToActivityLog} className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 hover:border-rose-500/50 transition-all cursor-pointer group flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 font-bold flex-shrink-0 group-hover:scale-110 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-white group-hover:text-rose-400 transition-colors">View Activity Log</div>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">Inspect recent administrator actions and platform governance events below.</p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: ACTIVITY HISTORY */}
      <div id="admin-activity-history-section" className={`${bgCard} p-6 rounded-2xl border space-y-4`}>
        <div className="flex items-center justify-between border-b border-slate-800/60 pb-4">
          <div>
            <h2 className={`text-base font-bold ${textPrimary} flex items-center gap-2`}>
              <Activity className="w-5 h-5 text-blue-500" />
              <span>Administrator Activity History</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Recent directory management actions displayed in simple language for compliance auditing.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-800 px-3 py-1 rounded-lg">
            SHOWING LATEST {activityLogs.length} ACTIONS
          </span>
        </div>

        <div className="space-y-2.5">
          {activityLogs.map((log) => {
            let icon = <Info className="w-4 h-4 text-blue-400" />;
            let badgeBg = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            
            if (log.type === 'add') {
              icon = <Plus className="w-4 h-4 text-emerald-400" />;
              badgeBg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            } else if (log.type === 'update') {
              icon = <Edit3 className="w-4 h-4 text-purple-400" />;
              badgeBg = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            } else if (log.type === 'enable') {
              icon = <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
              badgeBg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            } else if (log.type === 'disable') {
              icon = <Pause className="w-4 h-4 text-amber-400" />;
              badgeBg = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            } else if (log.type === 'refresh') {
              icon = <RefreshCw className="w-4 h-4 text-cyan-400" />;
              badgeBg = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
            } else if (log.type === 'remove') {
              icon = <Trash2 className="w-4 h-4 text-rose-400" />;
              badgeBg = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
            }

            return (
              <div key={log.id} className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/60 flex items-center justify-between gap-4 hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border ${badgeBg}`}>
                    {icon}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white flex items-center gap-2">
                      <span>{log.action}</span>
                    </div>
                    <div className="text-xs text-slate-300 mt-0.5">{log.detail}</div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
                    {log.time}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- SIDE PANEL: COMPANY DETAILS PANEL --- */}
      {selectedCompany && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedCompany(null)}>
          <div className="w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            {/* Drawer Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-5">
              <div className="flex items-center gap-3.5">
                <div className={`w-12 h-12 rounded-2xl ${selectedCompany.logoColor} text-white font-bold flex items-center justify-center text-base shadow-lg`}>
                  {selectedCompany.ticker.substring(0, 2)}
                </div>
                <div>
                  <div className="text-xs font-mono text-blue-400 font-bold">{selectedCompany.exchange} CATALOG ENTRY</div>
                  <h3 className="text-xl font-black text-white">{selectedCompany.company}</h3>
                  <div className="text-xs font-mono text-slate-400 mt-0.5">SYMBOL: <strong className="text-white">{selectedCompany.ticker}</strong></div>
                </div>
              </div>
              <button onClick={() => setSelectedCompany(null)} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Price Read-Only Notice */}
            <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>Live Feed Quote: <strong className="font-mono text-white text-sm">{selectedCompany.price}</strong></span>
              </div>
              <span className="text-[10px] font-mono uppercase bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">READ-ONLY</span>
            </div>

            {/* Detailed Properties Grid */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Directory Metadata</h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <div className="text-[10px] uppercase text-slate-500 font-semibold font-mono">Stock Symbol</div>
                  <div className="text-sm font-bold font-mono text-blue-400 mt-0.5">{selectedCompany.ticker}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <div className="text-[10px] uppercase text-slate-500 font-semibold font-mono">Company Name</div>
                  <div className="text-sm font-bold text-white mt-0.5 truncate">{selectedCompany.company}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <div className="text-[10px] uppercase text-slate-500 font-semibold font-mono">Exchange</div>
                  <div className="text-sm font-bold text-slate-200 mt-0.5">{selectedCompany.exchange}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <div className="text-[10px] uppercase text-slate-500 font-semibold font-mono">Sector</div>
                  <div className="text-sm font-bold text-slate-200 mt-0.5">{selectedCompany.sector}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <div className="text-[10px] uppercase text-slate-500 font-semibold font-mono">Country</div>
                  <div className="text-sm font-bold text-slate-200 mt-0.5">{selectedCompany.country}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <div className="text-[10px] uppercase text-slate-500 font-semibold font-mono">Market Status</div>
                  <div className="mt-1">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold border inline-block ${
                      selectedCompany.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      selectedCompany.status === 'Paused' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {selectedCompany.status}
                    </span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <div className="text-[10px] uppercase text-slate-500 font-semibold font-mono">Tradable Status</div>
                  <div className={`text-sm font-bold mt-0.5 ${selectedCompany.tradable ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {selectedCompany.tradable ? 'Yes (Trading Enabled)' : 'No (Trading Disabled)'}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <div className="text-[10px] uppercase text-slate-500 font-semibold font-mono">Date Added</div>
                  <div className="text-sm font-mono text-slate-300 mt-0.5">{selectedCompany.dateAdded}</div>
                </div>
              </div>

              {/* Data Feed Connection details */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-[10px] uppercase text-slate-500 font-semibold font-mono">Data Source Provider</div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                    <Server className="w-4 h-4" />
                    <span>{selectedCompany.dataSource}</span>
                  </span>
                  <span className="text-xs font-mono text-slate-400">Sync: {selectedCompany.lastSync}</span>
                </div>
              </div>

              {/* Administrator Notes */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono block">Administrator Notes</label>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed min-h-[70px]">
                  {selectedCompany.notes || 'No notes attached to this catalog record.'}
                </div>
              </div>
            </div>

            {/* Drawer Action Buttons */}
            <div className="pt-4 border-t border-slate-800 flex flex-col gap-2.5">
              <button
                onClick={() => {
                  const curr = selectedCompany;
                  setSelectedCompany(null);
                  if (curr) handleOpenEdit(curr);
                }}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-600/20"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Information & Notes</span>
              </button>
              <button
                onClick={() => handleToggleTradable(selectedCompany)}
                className={`w-full py-3 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer border ${
                  selectedCompany.tradable 
                    ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30' 
                    : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>{selectedCompany.tradable ? 'Disable Trading for this Company' : 'Enable Trading for this Company'}</span>
              </button>
              <button
                onClick={() => setSelectedCompany(null)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                Close Panel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: EDIT INFORMATION --- */}
      {editingCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <Edit3 className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold text-white">Edit Company Information</h3>
              </div>
              <button onClick={() => setEditingCompany(null)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Read-only reminder */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span>Stock Symbol: <strong className="text-white font-mono">{editingCompany.ticker}</strong></span>
              <span>Live Price: <strong className="text-emerald-400 font-mono">{editingCompany.price}</strong> (Read-Only)</span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Company Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Sector</label>
                  <select
                    value={formSector}
                    onChange={e => setFormSector(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  >
                    {sectors.filter(s => s !== 'ALL').map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Country</label>
                  <select
                    value={formCountry}
                    onChange={e => setFormCountry(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  >
                    {countries.filter(c => c !== 'ALL').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Exchange</label>
                <select
                  value={formExchange}
                  onChange={e => setFormExchange(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                >
                  {exchanges.filter(e => e !== 'ALL').map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>

              <div>
                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <div>
                    <span className="font-bold text-white block">Trading Enabled (Tradable)</span>
                    <span className="text-[11px] text-slate-400">Allow users to place orders and execute trades</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formTradable}
                    onChange={e => setFormTradable(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 text-blue-600 focus:ring-0"
                  />
                </label>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Administrator Notes</label>
                <textarea
                  rows={3}
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  placeholder="Enter governance, liquidity, or monitoring notes..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setEditingCompany(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow-lg shadow-blue-600/30"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: ADD NEW COMPANY --- */}
      {isAddingCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <Plus className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold text-white">Add New Company to Directory</h3>
              </div>
              <button onClick={() => setIsAddingCompany(false)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Symbol (Ticker)</label>
                  <input
                    type="text"
                    value={formTicker}
                    onChange={e => setFormTicker(e.target.value)}
                    placeholder="e.g. RDDT"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono uppercase focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="font-semibold text-slate-300 block mb-1">Company Name</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder="e.g. Reddit, Inc."
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Sector</label>
                  <select
                    value={formSector}
                    onChange={e => setFormSector(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  >
                    {sectors.filter(s => s !== 'ALL').map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Country</label>
                  <select
                    value={formCountry}
                    onChange={e => setFormCountry(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  >
                    {countries.filter(c => c !== 'ALL').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Exchange</label>
                  <select
                    value={formExchange}
                    onChange={e => setFormExchange(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  >
                    {exchanges.filter(e => e !== 'ALL').map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Data Source Feed</label>
                  <select
                    value={formSource}
                    onChange={e => setFormSource(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  >
                    {providers.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <div>
                    <span className="font-bold text-white block">Enable Trading Immediately</span>
                    <span className="text-[11px] text-slate-400">Set initial status to Active & Tradable</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formTradable}
                    onChange={e => setFormTradable(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 text-blue-600 focus:ring-0"
                  />
                </label>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Administrator Notes</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  placeholder="Optional compliance or listing notes..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsAddingCompany(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNewCompany}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow-lg shadow-blue-600/30"
              >
                Add Company
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: QUICK ASSIGN SECTOR --- */}
      {assigningSectorFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150" onClick={() => setAssigningSectorFor(null)}>
          <div className="w-full max-w-xs bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Assign Sector: <span className="text-blue-400 font-mono">{assigningSectorFor.ticker}</span></h3>
              <button onClick={() => setAssigningSectorFor(null)} className="p-1 rounded hover:bg-slate-800 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {sectors.filter(s => s !== 'ALL').map((sec) => (
                <button
                  key={sec}
                  onClick={() => handleAssignSector(assigningSectorFor, sec)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                    assigningSectorFor.sector === sec ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <span>{sec}</span>
                  {assigningSectorFor.sector === sec && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: QUICK ASSIGN EXCHANGE --- */}
      {assigningExchangeFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150" onClick={() => setAssigningExchangeFor(null)}>
          <div className="w-full max-w-xs bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Assign Exchange: <span className="text-blue-400 font-mono">{assigningExchangeFor.ticker}</span></h3>
              <button onClick={() => setAssigningExchangeFor(null)} className="p-1 rounded hover:bg-slate-800 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {exchanges.filter(e => e !== 'ALL').map((ex) => (
                <button
                  key={ex}
                  onClick={() => handleAssignExchange(assigningExchangeFor, ex)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                    assigningExchangeFor.exchange === ex ? 'bg-blue-600 text-white font-mono' : 'hover:bg-slate-800 text-slate-300 font-mono'
                  }`}
                >
                  <span>{ex}</span>
                  {assigningExchangeFor.exchange === ex && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: IMPORT COMPANY LIST --- */}
      {isImporting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <Upload className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Import Company List</h3>
              </div>
              <button onClick={() => setIsImporting(false)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Select a pre-verified market directory dataset to batch import new ticker symbols, sector classifications, and exchange connections.
            </p>

            <div className="space-y-2.5">
              <button
                onClick={() => handleSimulateImport('S&P 500 Emerging Tech Leaders')}
                className="w-full p-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-all group flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors">S&P 500 Emerging Tech Leaders</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 font-mono">Includes ARM, RDDT, SONY + auto-mapped sectors</div>
                </div>
                <Plus className="w-4 h-4 text-emerald-400" />
              </button>

              <button
                onClick={() => handleSimulateImport('European Blue Chips Snapshot')}
                className="w-full p-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-all group flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors">European Blue Chips Snapshot</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 font-mono">XETRA & LSE high volume constituents</div>
                </div>
                <Plus className="w-4 h-4 text-blue-400" />
              </button>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setIsImporting(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

