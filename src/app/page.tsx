'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  FolderTree, 
  Radio, 
  Sparkles, 
  Plus, 
  Search, 
  Edit3, 
  Music, 
  BookOpen, 
  CheckCircle2, 
  Database, 
  Globe, 
  Calendar, 
  FileText, 
  Users, 
  Image as ImageIcon, 
  ShieldCheck, 
  Settings, 
  LayoutDashboard, 
  Layers, 
  BellRing, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  RefreshCw, 
  LogOut, 
  Lock, 
  Archive, 
  Key,
  User,
  Trash2,
  Play,
  ArrowLeft,
  Eye,
  UserX,
  UserCheck,
  AlertTriangle
} from 'lucide-react';
import { SplashScreenManager } from './components/SplashScreenManager';
import { DeityManager } from './components/DeityManager';
import { DharmaKarthaManager } from './components/DharmaKarthaManager';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backendapis.saranamayyappa.in/api/v1';


interface CategoryItem {
  id: string;
  title: string;
  slug: string;
  isAudio: boolean;
  isArchived: boolean;
  description: string;
  subcategoriesCount?: number;
  devotionalCount?: number;
}

interface SubcategoryItem {
  id: string;
  title: string;
  slug: string;
  parentTitle: string;
  parentId: number;
  description: string;
}

interface ParentLookupItem {
  id: number;
  slug: string;
  title: string;
  parentId: number | null;
}

interface FullCategoryDetail {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  isAudio: boolean;
  displayOrder: number;
  subcategories: Array<{ id: string; title: string; slug: string; description: string | null }>;
  contents: Array<{ id: number; title: string; sacredText: string | null; meaning: string | null }>;
}

interface DevotionalContentItem {
  id: number;
  title: string;
  slug: string;
  sacredText?: string;
  meaning?: string;
  isPublished: boolean;
  categoryId: number;
}

interface FestivalItem {
  id: number;
  slug: string;
  festivalDate: string;
  sourceNote?: string;
  translations?: Array<{ name: string; description?: string }>;
}

interface AudioItem {
  id: number;
  title: string;
  slug: string;
  duration: string;
  status: string;
  url: string;
}

interface LanguageItem {
  id: number;
  code: string;
  name: string;
  nativeName: string;
  direction: string;
  isDefault: boolean;
  status: string;
  translationCount?: number;
}

interface AppUserItem {
  id: number;
  phoneNumber?: string;
  deviceUuid?: string;
  fullName?: string;
  email?: string;
  preferredLang: string;
  isSuspended: boolean;
  isDeleted?: boolean;
  deletedAt?: string;
  deletionRequested?: boolean;
  deletionRequestedAt?: string;
  deletionReason?: string;
  createdAt: string;
}

interface AuditLogItem {
  id: number;
  action: string;
  targetType: string;
  targetId?: string;
  detailsJson?: string;
  createdAt: string;
  admin?: { fullName: string; email: string };
}

interface CmsItem {
  id: number;
  key: string;
  value: string;
  description?: string;
  updatedAt: string;
}

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalLanguages: number;
  activeCategories: number;
  activeSubcategories: number;
  publishedDevotionalItems: number;
  totalAudioFiles: number;
  panchangamEvents: number;
  activeFestivals: number;
  publishedCmsPages?: number;
  database: string;
  systemHealth: string;
}

export default function EnterpriseSuperAdminDashboard() {
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [adminProfile, setAdminProfile] = useState<{ id: number; email: string; fullName: string; role: string }>({
    id: 1,
    email: 'admin@saranamayyappa.org',
    fullName: 'Saranam Ayyappa Master Admin',
    role: 'SUPER_ADMIN'
  });

  // Check auth synchronously on client mount before rendering anything
  useEffect(() => {
    try {
      const token = localStorage.getItem('ayyappa_admin_token');
      const saved = localStorage.getItem('ayyappa_admin_profile');
      if (token) {
        setIsAuthenticated(true);
        if (saved) {
          try {
            setAdminProfile(JSON.parse(saved));
          } catch {}
        }
      }
    } catch {} finally {
      setIsAuthChecking(false);
    }
  }, []);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Profile Edit State
  const [editFullName, setEditFullName] = useState('Saranam Ayyappa Master Admin');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<string>('categories');
  const [pageMode, setPageMode] = useState<'LIST' | 'EDIT_CATEGORY' | 'VIEW_CATEGORY' | 'EDIT_SUBCATEGORY'>('LIST');
  const [viewDetail, setViewDetail] = useState<FullCategoryDetail | null>(null);

  // Shared Data States
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [subcategories, setSubcategories] = useState<SubcategoryItem[]>([]);
  const [parentLookupList, setParentLookupList] = useState<ParentLookupItem[]>([]);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [subFormTitle, setSubFormTitle] = useState('');
  const [subFormSlug, setSubFormSlug] = useState('');
  const [subFormParentId, setSubFormParentId] = useState<number | ''>('');
  const [subFormDescription, setSubFormDescription] = useState('');
  const [devotionalContent, setDevotionalContent] = useState<DevotionalContentItem[]>([]);
  const [festivals, setFestivals] = useState<FestivalItem[]>([]);
  const [audioList, setAudioList] = useState<AudioItem[]>([]);
  const [cmsPages, setCmsPages] = useState<CmsItem[]>([]);
  const [languages, setLanguages] = useState<LanguageItem[]>([]);
  const [users, setUsers] = useState<AppUserItem[]>([]);
  const [deletionRequests, setDeletionRequests] = useState<AppUserItem[]>([]);
  const [softDeletedUsers, setSoftDeletedUsers] = useState<AppUserItem[]>([]);
  const [userSubTab, setUserSubTab] = useState<'all' | 'requests'>('all');
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  
  // Server-side Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [isAudioFilter, setIsAudioFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedLang, setSelectedLang] = useState('te');
  const [tickerText, setTickerText] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Category Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formIsAudio, setFormIsAudio] = useState(false);
  const [formDescription, setFormDescription] = useState('');

  // CMS Editor State
  const [selectedCmsKey, setSelectedCmsKey] = useState<string>('about_us');
  const [cmsEditTitle, setCmsEditTitle] = useState('');
  const [cmsEditContent, setCmsEditContent] = useState('');
  const [isSavingCms, setIsSavingCms] = useState(false);

  // Accordion State: Only one section can be expanded at a time
  const [expandedSection, setExpandedSection] = useState<'cms' | 'users' | 'categories' | 'vidhanam' | 'audio' | null>('cms');

  // Sidebar Subtitle States
  const [selectedUserSubtitle, setSelectedUserSubtitle] = useState<'devotees' | 'dharma_karthas'>('devotees');
  const [selectedCategorySubtitle, setSelectedCategorySubtitle] = useState<'temples' | 'poojas' | 'events'>('temples');
  const [selectedVidhanamSubtitle, setSelectedVidhanamSubtitle] = useState<'gods' | 'slokas' | 'astothrams' | 'stotras'>('gods');
  const [selectedMusicSubtitle, setSelectedMusicSubtitle] = useState<'bhajans' | 'slogans' | 'aarti'>('bhajans');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // Sync CMS Editor fields when active tab or selected key changes
  useEffect(() => {
    if (cmsPages.length > 0) {
      const page = cmsPages.find(p => p.key === selectedCmsKey);
      if (page) {
        setCmsEditTitle(page.description || page.key);
        setCmsEditContent(page.value || '');
      }
    }
  }, [selectedCmsKey, cmsPages]);

  const handleSaveCmsPage = async () => {
    if (!selectedCmsKey) return;
    setIsSavingCms(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/cms`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: selectedCmsKey,
          description: cmsEditTitle,
          value: cmsEditContent
        })
      });
      if (res.ok) {
        setNotification(`CMS Page "${cmsEditTitle || selectedCmsKey}" saved directly to MySQL database!`);
        loadCms();
      } else {
        alert('Failed to save CMS Page');
      }
    } catch {
      alert('Error connecting to API server');
    } finally {
      setIsSavingCms(false);
    }
  };
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [editingLangId, setEditingLangId] = useState<number | null>(null);
  const [langCode, setLangCode] = useState('');
  const [langName, setLangName] = useState('');

  // Devotional Content Modal State
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [contentTitle, setContentTitle] = useState('');
  const [contentSlug, setContentSlug] = useState('');
  const [contentCategoryId, setContentCategoryId] = useState('1');
  const [contentSacredText, setContentSacredText] = useState('');
  const [contentMeaning, setContentMeaning] = useState('');

  // Festival Modal State
  const [isFestivalModalOpen, setIsFestivalModalOpen] = useState(false);
  const [festivalName, setFestivalName] = useState('');
  const [festivalDate, setFestivalDate] = useState('2026-12-27');
  const [festivalNote, setFestivalNote] = useState('');
  const [livePanchangam, setLivePanchangam] = useState<any>(null);
  const [panchangamCity, setPanchangamCity] = useState('Hyderabad');

  useEffect(() => {
    if (notification) {
      const t = setTimeout(() => setNotification(null), 3500);
      return () => clearTimeout(t);
    }
  }, [notification]);

  // Auth Handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.message || 'Login failed. Invalid credentials.');
        return;
      }
      setIsAuthenticated(true);
      setAdminProfile(data.admin);
      setEditFullName(data.admin.fullName);
      if (typeof window !== 'undefined') {
        localStorage.setItem('ayyappa_admin_token', data.token || 'authenticated');
        localStorage.setItem('ayyappa_admin_profile', JSON.stringify(data.admin));
      }
      setNotification(`Welcome back, ${data.admin.fullName}!`);
    } catch {
      setAuthError('Cannot reach NestJS authentication API on port 4005. Please ensure backend is active.');
    }
  };

  const handleLogout = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('ayyappa_admin_token') : null;
      if (token) {
        await fetch(`${API_BASE_URL}/admin/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ token })
        });
      }
    } catch (e) {
      console.warn('Backend session logout notice:', e);
    }
    setIsAuthenticated(false);
    setLoginPassword('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ayyappa_admin_token');
      localStorage.removeItem('ayyappa_admin_profile');
    }
    setNotification('You have logged out securely. Backend session revoked.');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/admin/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: adminProfile.id, fullName: editFullName })
      });
      const data = await res.json();
      if (res.ok) {
        setAdminProfile(prev => ({ ...prev, fullName: editFullName }));
        setNotification('Admin Profile updated successfully!');
      } else {
        alert(data.message || 'Failed to update profile');
      }
    } catch {
      alert('Error updating profile');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/admin/profile/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: adminProfile.id,
          currentPassword,
          newPassword
        })
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setNotification('Password successfully rotated with Bcrypt 12 rounds encryption!');
      } else {
        alert(data.message || 'Password update failed');
      }
    } catch {
      alert('Error changing password');
    }
  };

  // 1. Load Categories
  const loadCategories = useCallback((pageNum = 1, search = '', lang = 'te', audio = '') => {
    setLoading(true);
    const url = new URL(`${API_BASE_URL}/admin/categories`);
    url.searchParams.set('page', String(pageNum));
    url.searchParams.set('limit', '15');
    url.searchParams.set('lang', lang);
    if (search) url.searchParams.set('search', search);
    if (audio) url.searchParams.set('isAudio', audio);

    fetch(url.toString())
      .then(res => res.json())
      .then(res => {
        if (res.data) {
          setCategories(res.data);
          setTotalPages(res.meta?.totalPages || 1);
          setTotalCount(res.meta?.totalRecords || 0);
          setPage(res.meta?.page || 1);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // 2. Load Subcategories
  const loadParentLookup = useCallback((lang = 'te') => {
    fetch(`${API_BASE_URL}/admin/categories/parents?lang=${lang}`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setParentLookupList(data); })
      .catch(() => {});
  }, []);

  const loadSubcategories = useCallback((pageNum = 1, search = '', lang = 'te') => {
    setLoading(true);
    const url = new URL(`${API_BASE_URL}/admin/subcategories`);
    url.searchParams.set('page', String(pageNum));
    url.searchParams.set('limit', '25');
    url.searchParams.set('lang', lang);
    if (search) url.searchParams.set('search', search);

    fetch(url.toString())
      .then(res => res.json())
      .then(res => {
        if (res.data) setSubcategories(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // 3. Load Devotional Content
  const loadDevotionalContent = useCallback((pageNum = 1, search = '') => {
    setLoading(true);
    const url = new URL(`${API_BASE_URL}/admin/content`);
    url.searchParams.set('page', String(pageNum));
    url.searchParams.set('limit', '15');
    if (search) url.searchParams.set('search', search);

    fetch(url.toString())
      .then(res => res.json())
      .then(res => {
        if (res.data) setDevotionalContent(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // 4. Load Festivals & Live Panchangam
  const loadPanchangam = useCallback((city = 'Hyderabad', lang = 'te') => {
    fetch(`${API_BASE_URL}/panchangam/day?city=${city}&lang=${lang}`)
      .then(res => res.json())
      .then(data => setLivePanchangam(data))
      .catch(() => {});
  }, []);

  const loadFestivals = useCallback((pageNum = 1, search = '') => {
    setLoading(true);
    const url = new URL(`${API_BASE_URL}/admin/panchangam/festivals`);
    url.searchParams.set('page', String(pageNum));
    url.searchParams.set('limit', '15');
    if (search) url.searchParams.set('search', search);

    fetch(url.toString())
      .then(res => res.json())
      .then(res => {
        if (res.data) setFestivals(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // 5. Load Audio
  const loadAudio = useCallback(() => {
    fetch(`${API_BASE_URL}/admin/media/audio`)
      .then(res => res.json())
      .then(res => { if (res.data) setAudioList(res.data); })
      .catch(() => {});
  }, []);

  // 6. Load CMS
  const loadCms = useCallback(() => {
    fetch(`${API_BASE_URL}/admin/cms`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setCmsPages(data); })
      .catch(() => {});
  }, []);

  const loadStats = useCallback(() => {
    fetch(`${API_BASE_URL}/admin/dashboard/stats`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => {});
  }, []);

  const loadLanguages = useCallback(() => {
    fetch(`${API_BASE_URL}/admin/languages`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setLanguages(data); })
      .catch(() => {});
  }, []);

  const loadUsers = useCallback(() => {
    fetch(`${API_BASE_URL}/admin/users?status=all`)
      .then(res => res.json())
      .then(res => { if (res.data) setUsers(res.data); })
      .catch(() => {});
  }, []);

  const loadDeletionRequests = useCallback(() => {
    fetch(`${API_BASE_URL}/admin/users/deletion-requests`)
      .then(res => res.json())
      .then(res => { if (res.data) setDeletionRequests(res.data); })
      .catch(() => {});
  }, []);

  const loadSoftDeletedUsers = useCallback(() => {
    fetch(`${API_BASE_URL}/admin/users/soft-deleted`)
      .then(res => res.json())
      .then(res => { if (res.data) setSoftDeletedUsers(res.data); })
      .catch(() => {});
  }, []);

  const handleSoftDeleteUser = async (userId: number, userName?: string) => {
    if (!window.confirm(`Are you sure you want to SOFT-DELETE devotee account #${userId} (${userName || 'User'})? They will be deactivated and unable to log in.`)) {
      return;
    }
    setActionLoadingId(userId);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/soft-delete`, { method: 'POST' });
      const json = await res.json();
      if (res.ok) {
        setNotification(json.message || 'User soft-deleted successfully.');
        setTimeout(() => setNotification(null), 4000);
        loadUsers();
        loadDeletionRequests();
        loadSoftDeletedUsers();
      } else {
        alert(json.message || 'Failed to soft delete user');
      }
    } catch {
      alert('Error executing soft delete');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRestoreUser = async (userId: number, userName?: string) => {
    if (!window.confirm(`Are you sure you want to RESTORE devotee account #${userId} (${userName || 'User'})? Their account will be reactivated.`)) {
      return;
    }
    setActionLoadingId(userId);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/restore`, { method: 'POST' });
      const json = await res.json();
      if (res.ok) {
        setNotification(json.message || 'User restored successfully.');
        setTimeout(() => setNotification(null), 4000);
        loadUsers();
        loadDeletionRequests();
        loadSoftDeletedUsers();
      } else {
        alert(json.message || 'Failed to restore user');
      }
    } catch {
      alert('Error executing restore');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handlePermanentDeleteUser = async (userId: number, userName?: string) => {
    if (!window.confirm(`⚠️ PERMANENT PURGE WARNING!\n\nAre you sure you want to PERMANENTLY delete devotee #${userId} (${userName || 'User'}) from the database?\n\nThis will permanently purge their profile, bookmarks, and preferences. THIS ACTION CANNOT BE UNDONE!`)) {
      return;
    }
    setActionLoadingId(userId);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/permanent-delete`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok) {
        setNotification(json.message || 'User permanently purged from database.');
        setTimeout(() => setNotification(null), 4000);
        loadUsers();
        loadDeletionRequests();
        loadSoftDeletedUsers();
      } else {
        alert(json.message || 'Failed to permanently delete user');
      }
    } catch {
      alert('Error executing permanent deletion');
    } finally {
      setActionLoadingId(null);
    }
  };

  const loadAuditLogs = useCallback(() => {
    fetch(`${API_BASE_URL}/admin/audit-logs`)
      .then(res => res.json())
      .then(res => { if (res.data) setAuditLogs(res.data); })
      .catch(() => {});
  }, []);

  const loadTicker = useCallback(() => {
    fetch(`${API_BASE_URL}/admin/settings/ticker`)
      .then(res => res.json())
      .then(data => { if (data.ticker) setTickerText(data.ticker); })
      .catch(() => {});
  }, []);

  // Data fetching on tab change and initial load
  useEffect(() => {
    if (isAuthenticated) {
      loadStats();
      loadParentLookup(selectedLang);
      loadSubcategories(1, '', selectedLang);
      loadDevotionalContent(1, '');
      loadFestivals(1, '');
      loadPanchangam(panchangamCity, selectedLang);
      loadAudio();
      loadCms();
      loadLanguages();
      loadUsers();
      loadDeletionRequests();
      loadSoftDeletedUsers();
      loadAuditLogs();
      loadTicker();

      if (activeTab === 'categories') { loadCategories(page, searchQuery, selectedLang, isAudioFilter); }
      if (activeTab === 'subcategories') { loadSubcategories(1, searchQuery, selectedLang); }
      if (activeTab === 'content') loadDevotionalContent(1, searchQuery);
      if (activeTab === 'panchangam') { loadFestivals(1, searchQuery); loadPanchangam(panchangamCity, selectedLang); }
      if (activeTab === 'users' || activeTab === 'soft_deleted_users') { loadUsers(); loadDeletionRequests(); loadSoftDeletedUsers(); }
    }
  }, [isAuthenticated, activeTab, loadStats, loadCategories, loadSubcategories, loadDevotionalContent, loadFestivals, loadAudio, loadCms, loadLanguages, loadUsers, loadDeletionRequests, loadSoftDeletedUsers, loadAuditLogs, loadTicker, loadParentLookup, selectedLang, isAudioFilter]);

  // Debounced server search
  useEffect(() => {
    if (isAuthenticated) {
      const handler = setTimeout(() => {
        if (activeTab === 'categories') loadCategories(1, searchQuery, selectedLang, isAudioFilter);
        if (activeTab === 'subcategories') loadSubcategories(1, searchQuery, selectedLang);
        if (activeTab === 'content') loadDevotionalContent(1, searchQuery);
        if (activeTab === 'panchangam') loadFestivals(1, searchQuery);
      }, 350);
      return () => clearTimeout(handler);
    }
  }, [searchQuery, selectedLang, isAudioFilter, activeTab, loadCategories, loadSubcategories, loadDevotionalContent, loadFestivals, isAuthenticated]);

  // CATEGORY ACTIONS (Full Page Mode)
  const handleOpenCreateCategory = () => {
    setEditingId(null);
    setFormTitle('');
    setFormSlug('');
    setFormIsAudio(false);
    setFormDescription('');
    setPageMode('EDIT_CATEGORY');
  };

  const handleOpenEditCategory = (item: CategoryItem) => {
    setEditingId(item.id);
    setFormTitle(item.title);
    setFormSlug(item.slug);
    setFormIsAudio(item.isAudio);
    setFormDescription(item.description);
    setPageMode('EDIT_CATEGORY');
  };

  const handleOpenViewCategory = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/categories/${id}?lang=${selectedLang}`);
      const data = await res.json();
      setViewDetail(data);
      setPageMode('VIEW_CATEGORY');
    } catch {
      alert('Error loading category view details');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCategory = async () => {
    if (!formTitle.trim()) {
      alert('Please enter a category title');
      return;
    }

    const payload = {
      title: formTitle.trim(),
      slug: formSlug.trim() || `category-${Date.now()}`,
      isAudio: formIsAudio,
      description: formDescription.trim(),
      lang: selectedLang
    };

    try {
      if (editingId) {
        await fetch(`${API_BASE_URL}/admin/categories/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        setNotification(`Updated "${formTitle}" in MySQL!`);
      } else {
        await fetch(`${API_BASE_URL}/admin/categories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        setNotification(`Created category "${formTitle}" in MySQL!`);
      }
      loadCategories(page, searchQuery, selectedLang, isAudioFilter);
      loadStats();
    } catch (e: any) {
      alert('Error saving category: ' + e.message);
    }

    setIsModalOpen(false);
    setPageMode('LIST');
  };

  const handleDeleteCategory = async (id: string, title: string) => {
    if (confirm(`Archive / Delete "${title}" (#${id})?\n\nThis will safely deactivate the category in MySQL without destroying sacred verses or offline audio.`)) {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/categories/${id}`, { method: 'DELETE' });
        const json = await res.json();
        if (!res.ok) {
          alert(`PROTECTED ACTION BLOCKED:\n\n${json.message}`);
          return;
        }
        setNotification(json.message);
        loadCategories(page, searchQuery, selectedLang, isAudioFilter);
        loadSubcategories(1, '', selectedLang);
        loadStats();
      } catch (e: any) {
        alert('Archival error: ' + e.message);
      }
    }
  };

  // SUBCATEGORY & CHAPTER ACTIONS (Full Page Mode)
  const handleOpenCreateSubcategory = () => {
    setEditingSubId(null);
    setSubFormTitle('');
    setSubFormSlug('');
    setSubFormParentId(parentLookupList.length > 0 ? parentLookupList[0].id : '');
    setSubFormDescription('');
    setPageMode('EDIT_SUBCATEGORY');
  };

  const handleOpenEditSubcategory = (item: SubcategoryItem) => {
    setEditingSubId(item.id);
    setSubFormTitle(item.title);
    setSubFormSlug(item.slug);
    setSubFormParentId(item.parentId);
    setSubFormDescription(item.description);
    setPageMode('EDIT_SUBCATEGORY');
  };

  const handleSaveSubcategory = async () => {
    if (!subFormTitle.trim()) {
      alert('Please enter a subcategory / chapter title');
      return;
    }
    if (!subFormParentId) {
      alert('Please select a Parent Category or Vratham');
      return;
    }

    const payload = {
      title: subFormTitle.trim(),
      slug: subFormSlug.trim() || `sub-${Date.now()}`,
      parentId: Number(subFormParentId),
      isAudio: false,
      description: subFormDescription.trim(),
      lang: selectedLang
    };

    try {
      if (editingSubId) {
        await fetch(`${API_BASE_URL}/admin/categories/${editingSubId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        setNotification(`Updated subcategory "${subFormTitle}" in MySQL!`);
      } else {
        await fetch(`${API_BASE_URL}/admin/categories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        setNotification(`Created subcategory "${subFormTitle}" in MySQL!`);
      }
      loadSubcategories(1, '', selectedLang);
      loadParentLookup(selectedLang);
      loadStats();
    } catch (e: any) {
      alert('Error saving subcategory: ' + e.message);
    }
    setIsSubModalOpen(false);
    setPageMode('LIST');
  };

  const handleDeleteSubcategory = async (id: string, title: string) => {
    if (confirm(`Archive subcategory "${title}" (#${id})?`)) {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/categories/${id}`, { method: 'DELETE' });
        const json = await res.json();
        if (!res.ok) {
          alert(`ACTION BLOCKED: ${json.message}`);
          return;
        }
        setNotification(json.message);
        loadSubcategories(1, '', selectedLang);
        loadStats();
      } catch (e: any) {
        alert('Archival error: ' + e.message);
      }
    }
  };

  // LANGUAGE ACTIONS
  const handleOpenCreateLanguage = () => {
    setEditingLangId(null);
    setLangCode('');
    setLangName('');
    setIsLangModalOpen(true);
  };

  const handleOpenEditLanguage = (l: LanguageItem) => {
    setEditingLangId(l.id);
    setLangCode(l.code);
    setLangName(l.name);
    setIsLangModalOpen(true);
  };

  const handleSaveLanguage = async () => {
    if (!langName.trim() || (!editingLangId && !langCode.trim())) {
      alert('Please fill out all required language fields');
      return;
    }

    try {
      if (editingLangId) {
        await fetch(`${API_BASE_URL}/admin/languages/${editingLangId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: langName.trim() })
        });
        setNotification(`Updated language "${langName}" in MySQL!`);
      } else {
        const res = await fetch(`${API_BASE_URL}/admin/languages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: langCode.toLowerCase().trim(), name: langName.trim() })
        });
        const json = await res.json();
        if (!res.ok) {
          alert(json.message || 'Error creating language');
          return;
        }
        setNotification(`Created language "${langName}" in MySQL!`);
      }
      loadLanguages();
      loadStats();
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
    setIsLangModalOpen(false);
  };

  const handleDeleteLanguage = async (id: number, name: string) => {
    if (confirm(`Delete language "${name}" (#${id}) from database?`)) {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/languages/${id}`, { method: 'DELETE' });
        const json = await res.json();
        if (!res.ok) {
          alert(`PROTECTED ACTION BLOCKED:\n\n${json.message}`);
          return;
        }
        setNotification(json.message);
        loadLanguages();
        loadStats();
      } catch (e: any) {
        alert('Delete error: ' + e.message);
      }
    }
  };

  // DEVOTIONAL CONTENT ACTIONS
  const handleOpenCreateContent = () => {
    setContentTitle('');
    setContentSlug('');
    setContentSacredText('');
    setContentMeaning('');
    setIsContentModalOpen(true);
  };

  const handleSaveContent = async () => {
    if (!contentTitle.trim()) {
      alert('Please enter a content title');
      return;
    }
    try {
      await fetch(`${API_BASE_URL}/admin/content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: Number(contentCategoryId),
          title: contentTitle.trim(),
          slug: contentSlug.trim() || `verse-${Date.now()}`,
          sacredText: contentSacredText,
          meaning: contentMeaning
        })
      });
      setNotification(`Created sacred text "${contentTitle}"!`);
      loadDevotionalContent();
      setIsContentModalOpen(false);
    } catch {
      alert('Error saving content');
    }
  };

  const handleDeleteContent = async (id: number, title: string) => {
    if (confirm(`Delete "${title}" (#${id})?`)) {
      await fetch(`${API_BASE_URL}/admin/content/${id}`, { method: 'DELETE' });
      setNotification(`Removed "${title}"`);
      loadDevotionalContent();
    }
  };

  // FESTIVAL ACTIONS
  const handleOpenCreateFestival = () => {
    setFestivalName('');
    setFestivalDate('2026-12-27');
    setFestivalNote('');
    setIsFestivalModalOpen(true);
  };

  const handleSaveFestival = async () => {
    if (!festivalName.trim()) {
      alert('Please enter festival name');
      return;
    }
    try {
      await fetch(`${API_BASE_URL}/admin/panchangam/festivals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: festivalName.trim(),
          slug: `fest-${Date.now()}`,
          date: festivalDate,
          sourceNote: festivalNote,
          lang: selectedLang
        })
      });
      setNotification(`Created festival "${festivalName}"!`);
      loadFestivals();
      setIsFestivalModalOpen(false);
    } catch {
      alert('Error saving festival');
    }
  };

  const handleDeleteFestival = async (id: number) => {
    if (confirm(`Delete festival #${id}?`)) {
      await fetch(`${API_BASE_URL}/admin/panchangam/festivals/${id}`, { method: 'DELETE' });
      setNotification('Festival deleted');
      loadFestivals();
    }
  };

  // TICKER ACTION
  const handleSaveTicker = async () => {
    try {
      await fetch(`${API_BASE_URL}/admin/settings/ticker`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: tickerText })
      });
      setNotification('Devotional Announcement Ticker saved to MySQL and published to mobile!');
      loadAuditLogs();
    } catch {
      alert('Failed to update ticker');
    }
  };

  // Show a seamless devotional spinner while verifying local session
  // This completely eliminates the 2-second login screen flash on page refresh!
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[var(--admin-bg-base)] flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-full border-2 border-[var(--admin-gold)] bg-[var(--admin-maroon-dark)] flex items-center justify-center font-bold text-2xl text-[var(--admin-gold)] shadow-2xl mb-4 animate-pulse">
          🕉️
        </div>
        <p className="text-sm font-semibold text-[var(--admin-gold)] tracking-wider">
          Loading Admin Console...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[var(--admin-bg-base)] flex items-center justify-center p-4">
        <div className="bg-[var(--admin-bg-surface)] border-2 border-[var(--admin-gold)] rounded-2xl w-full max-w-md p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full border-2 border-[var(--admin-gold)] bg-[var(--admin-maroon-dark)] flex items-center justify-center font-bold text-2xl text-[var(--admin-gold)] shadow-md mx-auto">
              🕉️
            </div>
            <h1 className="text-xl font-bold text-[var(--admin-gold)] uppercase tracking-wide">Saranam Ayyappa</h1>
            <p className="text-xs text-[var(--admin-ivory)] opacity-80">Enterprise Super Admin Portal</p>
          </div>

          {authError && (
            <div className="p-3 bg-red-950/40 border border-red-500/50 rounded-lg text-xs text-red-300">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--admin-ivory)] uppercase mb-1">Admin Email</label>
              <input 
                type="email" 
                value={loginEmail} 
                onChange={(e) => setLoginEmail(e.target.value)} 
                required
                className="w-full bg-[var(--admin-bg-base)] border border-[var(--admin-border-subtle)] rounded-lg px-3 py-2 text-xs text-[var(--admin-ivory)] focus:outline-none focus:border-[var(--admin-gold)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--admin-ivory)] uppercase mb-1">Master Password</label>
              <input 
                type="password" 
                value={loginPassword} 
                placeholder="Enter password..."
                onChange={(e) => setLoginPassword(e.target.value)} 
                required
                className="w-full bg-[var(--admin-bg-base)] border border-[var(--admin-border-subtle)] rounded-lg px-3 py-2 text-xs text-[var(--admin-ivory)] focus:outline-none focus:border-[var(--admin-gold)]"
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-[var(--admin-maroon)] hover:bg-[var(--admin-maroon-mid)] border border-[var(--admin-gold)] text-[var(--admin-ivory)] py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4 text-[var(--admin-gold)]" />
              <span>Authenticate & Enter Console</span>
            </button>
          </form>

          <div className="p-3 bg-[var(--admin-bg-base)] rounded-lg border border-[var(--admin-border-subtle)] text-[11px] text-[var(--admin-ivory)] space-y-1">
            <p className="font-semibold text-[var(--admin-gold)]">Security Standard:</p>
            <p className="text-[var(--admin-ivory)] opacity-75">Bcrypt Salt 12 Rounds • Real Database Auth • Zero Mock Data</p>
          </div>
        </div>
      </div>
    );
  }

  // Top 6 Ordered Primary Menu with Subtitles
  const primarySidebarMenu = [
    {
      key: 'dashboard',
      label: '1. Dashboard',
      icon: LayoutDashboard,
      onClick: () => {
        setActiveTab('dashboard');
        setExpandedSection(null);
      },
      isActive: activeTab === 'dashboard',
    },
    {
      key: 'cms',
      label: '2. Website/App CMS',
      icon: FileText,
      onClick: () => {
        setActiveTab('cms');
        setExpandedSection(prev => prev === 'cms' ? null : 'cms');
      },
      isActive: activeTab === 'cms',
      isExpanded: expandedSection === 'cms',
      subtitles: [
        {
          key: 'about_us',
          label: 'About Us',
          onClick: () => { setActiveTab('cms'); setSelectedCmsKey('about_us'); },
          isActive: activeTab === 'cms' && selectedCmsKey === 'about_us',
        },
        {
          key: 'terms_conditions',
          label: 'Terms & Conditions',
          onClick: () => { setActiveTab('cms'); setSelectedCmsKey('terms_conditions'); },
          isActive: activeTab === 'cms' && selectedCmsKey === 'terms_conditions',
        },
        {
          key: 'privacy_policy',
          label: 'Privacy Policy',
          onClick: () => { setActiveTab('cms'); setSelectedCmsKey('privacy_policy'); },
          isActive: activeTab === 'cms' && selectedCmsKey === 'privacy_policy',
        },
        {
          key: 'refund_policy',
          label: 'Refund Policy',
          onClick: () => { setActiveTab('cms'); setSelectedCmsKey('refund_policy'); },
          isActive: activeTab === 'cms' && selectedCmsKey === 'refund_policy',
        },
        {
          key: 'sabarimala_guidelines',
          label: 'Sabarimala Guidelines',
          onClick: () => { setActiveTab('cms'); setSelectedCmsKey('sabarimala_guidelines'); },
          isActive: activeTab === 'cms' && selectedCmsKey === 'sabarimala_guidelines',
        },
      ],
    },
    {
      key: 'users',
      label: '3. User Management',
      icon: Users,
      onClick: () => {
        setActiveTab('users');
        setExpandedSection(prev => prev === 'users' ? null : 'users');
      },
      isActive: activeTab === 'users',
      isExpanded: expandedSection === 'users',
      subtitles: [
        {
          key: 'devotees',
          label: 'Devotees',
          onClick: () => {
            setActiveTab('users');
            setSelectedUserSubtitle('devotees');
            setUserSubTab('all');
          },
          isActive: activeTab === 'users' && selectedUserSubtitle === 'devotees',
        },
        {
          key: 'dharma_karthas',
          label: 'Dharma Karthas',
          onClick: () => {
            setActiveTab('users');
            setSelectedUserSubtitle('dharma_karthas');
            setUserSubTab('all');
          },
          isActive: activeTab === 'users' && selectedUserSubtitle === 'dharma_karthas',
        },
      ],
    },
    {
      key: 'categories',
      label: '4. Categories',
      icon: FolderTree,
      onClick: () => {
        setActiveTab('categories');
        setExpandedSection(prev => prev === 'categories' ? null : 'categories');
      },
      isActive: activeTab === 'categories',
      isExpanded: expandedSection === 'categories',
      subtitles: [
        {
          key: 'temples',
          label: 'Temples',
          onClick: () => {
            setActiveTab('categories');
            setSelectedCategorySubtitle('temples');
            setSearchQuery('temple');
            loadCategories(1, 'temple', selectedLang);
          },
          isActive: activeTab === 'categories' && selectedCategorySubtitle === 'temples',
        },
        {
          key: 'poojas',
          label: 'Poojas',
          onClick: () => {
            setActiveTab('categories');
            setSelectedCategorySubtitle('poojas');
            setSearchQuery('pooja');
            loadCategories(1, 'pooja', selectedLang);
          },
          isActive: activeTab === 'categories' && selectedCategorySubtitle === 'poojas',
        },
        {
          key: 'events',
          label: 'Events',
          onClick: () => {
            setActiveTab('categories');
            setSelectedCategorySubtitle('events');
            setSearchQuery('event');
            loadCategories(1, 'event', selectedLang);
          },
          isActive: activeTab === 'categories' && selectedCategorySubtitle === 'events',
        },
      ],
    },
    {
      key: 'vidhanam',
      label: '5. Spiritual Management Vidhanam',
      icon: BookOpen,
      onClick: () => {
        setActiveTab('deities');
        setSelectedVidhanamSubtitle('gods');
        setExpandedSection(prev => prev === 'vidhanam' ? null : 'vidhanam');
      },
      isActive: activeTab === 'deities' || activeTab === 'subcategories' || activeTab === 'content',
      isExpanded: expandedSection === 'vidhanam',
      subtitles: [
        {
          key: 'gods',
          label: 'Gods / Goddesses',
          onClick: () => {
            setActiveTab('deities');
            setSelectedVidhanamSubtitle('gods');
          },
          isActive: activeTab === 'deities' && selectedVidhanamSubtitle === 'gods',
        },
        {
          key: 'slokas',
          label: 'Slokas',
          onClick: () => {
            setActiveTab('content');
            setSelectedVidhanamSubtitle('slokas');
            loadDevotionalContent(1, 'sloka');
          },
          isActive: activeTab === 'content' && selectedVidhanamSubtitle === 'slokas',
        },
        {
          key: 'astothrams',
          label: 'Astothrams',
          onClick: () => {
            setActiveTab('content');
            setSelectedVidhanamSubtitle('astothrams');
            loadDevotionalContent(1, 'astothram');
          },
          isActive: activeTab === 'content' && selectedVidhanamSubtitle === 'astothrams',
        },
        {
          key: 'stotras',
          label: 'Stotras',
          onClick: () => {
            setActiveTab('content');
            setSelectedVidhanamSubtitle('stotras');
            loadDevotionalContent(1, 'stotra');
          },
          isActive: activeTab === 'content' && selectedVidhanamSubtitle === 'stotras',
        },
      ],
    },
    {
      key: 'audio',
      label: '6. Spiritual Music',
      icon: Music,
      onClick: () => {
        setActiveTab('audio');
        setExpandedSection(prev => prev === 'audio' ? null : 'audio');
      },
      isActive: activeTab === 'audio',
      isExpanded: expandedSection === 'audio',
      subtitles: [
        {
          key: 'bhajans',
          label: 'Bhajans',
          onClick: () => {
            setActiveTab('audio');
            setSelectedMusicSubtitle('bhajans');
          },
          isActive: activeTab === 'audio' && selectedMusicSubtitle === 'bhajans',
        },
        {
          key: 'slogans',
          label: 'Slogans',
          onClick: () => {
            setActiveTab('audio');
            setSelectedMusicSubtitle('slogans');
          },
          isActive: activeTab === 'audio' && selectedMusicSubtitle === 'slogans',
        },
        {
          key: 'aarti',
          label: 'Aarti Songs',
          onClick: () => {
            setActiveTab('audio');
            setSelectedMusicSubtitle('aarti');
          },
          isActive: activeTab === 'audio' && selectedMusicSubtitle === 'aarti',
        },
      ],
    },
  ];

  // System & Secondary Administrative Tools
  const secondarySidebarMenu = [
    { key: 'soft_deleted_users', label: `Soft Deleted Users (${softDeletedUsers.length})`, icon: UserX, onClick: () => setActiveTab('soft_deleted_users'), isActive: activeTab === 'soft_deleted_users' },
    { key: 'panchangam', label: `Panchangam & Festivals (${stats?.activeFestivals ?? festivals.length})`, icon: Calendar, onClick: () => setActiveTab('panchangam'), isActive: activeTab === 'panchangam' },
    { key: 'splash', label: 'Splash Screen', icon: ImageIcon, onClick: () => setActiveTab('splash'), isActive: activeTab === 'splash' },
    { key: 'languages', label: `Languages (${stats?.totalLanguages ?? languages.length} in DB)`, icon: Globe, onClick: () => setActiveTab('languages'), isActive: activeTab === 'languages' },
    { key: 'settings', label: 'App Settings & Ticker', icon: Settings, onClick: () => setActiveTab('settings'), isActive: activeTab === 'settings' },
    { key: 'audit', label: `Audit Logs (${auditLogs.length})`, icon: Database, onClick: () => setActiveTab('audit'), isActive: activeTab === 'audit' },
  ];

  const currentHeaderTitle = (() => {
    if (activeTab === 'dashboard') return '1. Dashboard';
    if (activeTab === 'cms') return '2. Website / App CMS Management';
    if (activeTab === 'users') return `3. User Management — ${selectedUserSubtitle === 'dharma_karthas' ? 'Dharma Karthas' : 'Devotees'}`;
    if (activeTab === 'categories') return `4. Categories — ${selectedCategorySubtitle.toUpperCase()}`;
    if (activeTab === 'deities') return '5. Spiritual Management Vidhanam — Gods & Goddesses Management';
    if (activeTab === 'subcategories' || activeTab === 'content') return `5. Spiritual Management Vidhanam — ${selectedVidhanamSubtitle === 'gods' ? 'Gods & Goddesses' : selectedVidhanamSubtitle === 'slokas' ? 'Slokas' : selectedVidhanamSubtitle === 'astothrams' ? 'Astothrams' : 'Stotras'}`;
    if (activeTab === 'audio') return `6. Spiritual Music — ${selectedMusicSubtitle.toUpperCase()}`;
    if (activeTab === 'soft_deleted_users') return 'Soft Deleted Users Archive';
    if (activeTab === 'panchangam') return 'Panchangam & Festivals';
    if (activeTab === 'splash') return 'Splash Screen Manager';
    if (activeTab === 'languages') return 'Language Translations';
    if (activeTab === 'profile') return 'Admin Profile';
    if (activeTab === 'settings') return 'App Settings & Ticker';
    if (activeTab === 'audit') return 'Security Audit Trail';
    return 'Super Admin Console';
  })();

  return (
    <div className="flex h-screen bg-[#121212] overflow-hidden text-gray-100">
      {notification && (
        <div className="fixed top-5 right-5 z-50 bg-[#1E1E1E] border border-[#FFB300] text-[#FFB300] px-4 py-3 rounded-lg shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="font-semibold text-xs">{notification}</span>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-72 bg-[#181818] border-r border-[#2C2C2C] flex flex-col justify-between flex-shrink-0">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-[#2C2C2C] flex items-center justify-center">
            <img 
              src="/images/saranam-ayyappa-logo.jpg" 
              alt="Saranam Ayyappa — Thathwamasi" 
              className="w-full max-h-24 object-contain rounded-xl shadow-lg border border-[var(--admin-gold)]/40 hover:border-[var(--admin-gold)] transition"
            />
          </div>

          <nav className="p-3 space-y-1 overflow-y-auto flex-1">
            {/* TOP 6 ORDERED MENU ITEMS */}
            {primarySidebarMenu.map(item => {
              const Icon = item.icon;
              const hasSubtitles = item.subtitles && item.subtitles.length > 0;

              if (hasSubtitles) {
                return (
                  <div key={item.key} className="space-y-1">
                    <button
                      onClick={item.onClick}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                        item.isActive 
                          ? 'bg-orange-600/25 text-[#FFB300] border border-orange-500/40 shadow-sm' 
                          : 'text-gray-400 hover:text-gray-200 hover:bg-neutral-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <Icon className="w-4 h-4 flex-shrink-0 text-orange-400/90" />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-orange-400/80" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                      )}
                    </button>

                    {item.isExpanded && (
                      <div className="pl-3 pr-1 py-1 space-y-0.5 border-l-2 border-orange-500/40 ml-4 my-1 animate-in fade-in slide-in-from-top-1 duration-150">
                        {item.subtitles?.map(sub => (
                          <button
                            key={sub.key}
                            onClick={sub.onClick}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all text-left group ${
                              sub.isActive
                                ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/10 text-[#FFB300] font-semibold border border-[#FFB300]/40 shadow-sm'
                                : 'text-gray-400 hover:text-gray-100 hover:bg-neutral-800/60'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className={`w-1.5 h-1.5 rounded-full transition-transform group-hover:scale-125 ${sub.isActive ? 'bg-[#FFB300] shadow-[0_0_6px_#FFB300]' : 'bg-gray-600'}`} />
                              <span className="truncate">{sub.label}</span>
                            </div>
                            {sub.isActive && (
                              <span className="text-[10px] text-[#FFB300] font-bold">●</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <button
                  key={item.key}
                  onClick={item.onClick}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    item.isActive 
                      ? 'bg-orange-600/25 text-[#FFB300] border border-orange-500/40 shadow-sm' 
                      : 'text-gray-400 hover:text-gray-200 hover:bg-neutral-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0 text-orange-400/90" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}

            {/* SECONDARY SYSTEM & TOOLS SECTION */}
            <div className="pt-3 mt-2 border-t border-[#252525]">
              <p className="px-3 pb-1 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                System & Archives
              </p>
              {secondarySidebarMenu.map(sec => {
                const SecIcon = sec.icon;
                return (
                  <button
                    key={sec.key}
                    onClick={sec.onClick}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      sec.isActive
                        ? 'bg-orange-600/25 text-[#FFB300] border border-orange-500/40 shadow-sm'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-neutral-800/60'
                    }`}
                  >
                    <SecIcon className="w-4 h-4 flex-shrink-0 text-orange-400/90" />
                    <span className="truncate">{sec.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Industry-Standard Admin User Profile Footer */}
          <div className="p-3 border-t border-[#2C2C2C] bg-[#141414]/90">
            <div className="flex items-center justify-between p-2 rounded-xl bg-[#1F1F1F] border border-[#2C2C2C] hover:border-[var(--admin-gold)]/40 transition group">
              <button 
                onClick={() => setActiveTab('profile')}
                className="flex items-center gap-2.5 min-w-0 flex-1 text-left"
                title="View Admin Profile Settings"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 border border-[var(--admin-gold)] flex items-center justify-center text-xs font-bold text-white shadow-md flex-shrink-0">
                  {adminProfile.fullName?.charAt(0) || 'A'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[var(--admin-ivory)] truncate group-hover:text-[var(--admin-gold)] transition">
                    {adminProfile.fullName}
                  </p>
                  <p className="text-[10px] text-gray-400 truncate capitalize font-medium">
                    {adminProfile.role?.toLowerCase().replace('_', ' ') || 'Super Admin'}
                  </p>
                </div>
              </button>

              <button
                onClick={handleLogout}
                title="Log out securely"
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition flex items-center justify-center flex-shrink-0 text-sm font-semibold"
              >
                <span className="text-base text-gray-400 hover:text-red-400 transition font-bold leading-none">→</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="h-16 border-b border-[var(--admin-border-subtle)] px-8 flex items-center justify-between bg-[var(--admin-bg-surface)] sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-sm text-[var(--admin-ivory)] uppercase tracking-wide">
              {currentHeaderTitle}
            </span>
          </div>

          {/* Right-side corner Profile & Account Dropdown Widget (Hover only) */}
          <div 
            className="relative"
            onMouseEnter={() => setIsProfileDropdownOpen(true)}
            onMouseLeave={() => setIsProfileDropdownOpen(false)}
          >
            <div 
              className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-[var(--admin-bg-card)] border border-[var(--admin-border-subtle)] hover:border-[var(--admin-gold)] transition group shadow-md cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-[var(--admin-maroon-dark)] border-2 border-[var(--admin-gold)] flex items-center justify-center text-xs font-bold text-[var(--admin-gold)] shadow flex-shrink-0">
                S
              </div>
              <div className="text-left hidden sm:block max-w-[150px]">
                <p className="text-xs font-bold text-[var(--admin-ivory)] truncate group-hover:text-[var(--admin-gold)] transition">
                  {adminProfile.fullName}
                </p>
                <p className="text-[10px] text-[var(--admin-gold)] font-medium leading-tight">My Account</p>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-[var(--admin-gold)] transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
            </div>

            {/* Dynamic Dropdown Menu on Hover */}
            {isProfileDropdownOpen && (
              <div 
                className="absolute right-0 top-full mt-2 w-60 bg-[var(--admin-bg-card)] border border-[var(--admin-border-subtle)] rounded-xl shadow-2xl p-2 z-50 space-y-1 backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <div className="px-3 py-2 border-b border-[var(--admin-border-subtle)] mb-1">
                  <p className="text-xs font-bold text-[var(--admin-gold)] truncate">{adminProfile.fullName}</p>
                  <p className="text-[10px] text-[var(--admin-ivory)] opacity-60 truncate">{adminProfile.email}</p>
                </div>

                <button
                  onClick={() => {
                    setActiveTab('profile');
                    setIsProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-[var(--admin-ivory)] hover:bg-[var(--admin-maroon-mid)] hover:text-[var(--admin-gold)] transition-colors text-left"
                >
                  <User className="w-4 h-4 text-[var(--admin-gold)]" />
                  <span>View Profile</span>
                </button>

                <button
                  onClick={() => {
                    setIsProfileDropdownOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* TAB: DYNAMIC SPLASH SCREEN MANAGEMENT */}
          {activeTab === 'splash' && <SplashScreenManager />}

          {/* TAB 1: CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] overflow-hidden space-y-0">
              <div className="p-5 border-b border-[#2C2C2C] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Server Search..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#141414] border border-[#2C2C2C] rounded-lg pl-9 pr-4 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#FFB300]"
                    />
                  </div>

                  <select 
                    value={selectedLang}
                    onChange={(e) => setSelectedLang(e.target.value)}
                    className="bg-[#141414] border border-[#2C2C2C] rounded-lg px-3 py-2 text-xs text-amber-400 focus:outline-none focus:border-[#FFB300]"
                  >
                    <option value="te">Telugu (తెలుగు)</option>
                    <option value="kn">Kannada (ಕನ್ನಡ)</option>
                    <option value="en">English</option>
                    <option value="ta">Tamil (தமிழ்)</option>
                    <option value="hi">Hindi (हिन्दी)</option>
                  </select>

                  <select 
                    value={isAudioFilter}
                    onChange={(e) => setIsAudioFilter(e.target.value)}
                    className="bg-[#141414] border border-[#2C2C2C] rounded-lg px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-[#FFB300]"
                  >
                    <option value="">All Types</option>
                    <option value="true">Audio Only</option>
                    <option value="false">Text / Slokas Only</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <span className="text-xs text-gray-400">
                    Total: <strong className="text-gray-200">{totalCount}</strong> categories
                  </span>
                  <button 
                    onClick={handleOpenCreateCategory}
                    className="flex items-center justify-center gap-2 bg-[#D84315] hover:bg-[#BF360C] text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow-md shadow-orange-950"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Category</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto min-h-[300px]">
                {loading ? (
                  <div className="p-12 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#FFB300]" />
                    <span>Querying MySQL via Prisma server-side...</span>
                  </div>
                ) : (
                  <table className="w-full text-left text-xs text-gray-300">
                    <thead className="bg-[#181818] uppercase tracking-wider text-gray-400 border-b border-[#2C2C2C]">
                      <tr>
                        <th className="px-6 py-3.5">ID</th>
                        <th className="px-6 py-3.5">Category Title ({selectedLang.toUpperCase()})</th>
                        <th className="px-6 py-3.5">Slug</th>
                        <th className="px-6 py-3.5">Dependencies</th>
                        <th className="px-6 py-3.5">Content Type</th>
                        <th className="px-6 py-3.5">Description</th>
                        <th className="px-6 py-3.5 text-center font-bold text-amber-400">Options / Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2C2C2C]">
                      {categories.map((item) => (
                        <tr key={item.id} className="hover:bg-neutral-800/40 transition">
                          <td className="px-6 py-4 font-mono text-gray-500">#{item.id}</td>
                          <td className="px-6 py-4 font-semibold text-gray-100 flex items-center gap-2">
                            <span className="text-orange-400">🪔</span>
                            <span>{item.title}</span>
                          </td>
                          <td className="px-6 py-4 font-mono text-amber-400/90">{item.slug}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 rounded bg-neutral-800 text-gray-300 border border-neutral-700 text-[10px]">
                              {item.subcategoriesCount || 0} sub / {item.devotionalCount || 0} items
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {item.isAudio ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
                                <Music className="w-3 h-3" /> Audio Track
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/30">
                                <BookOpen className="w-3 h-3" /> Slokas & Mantras
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-gray-400 max-w-xs truncate">{item.description || '—'}</td>
                          <td className="px-6 py-4 text-center space-x-2 whitespace-nowrap">
                            <button 
                              onClick={() => handleOpenViewCategory(item.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded text-sky-400 text-xs font-semibold transition"
                              title="View Category Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View</span>
                            </button>
                            <button 
                              onClick={() => handleOpenEditCategory(item)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded text-amber-400 text-xs font-semibold transition"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            <button 
                              onClick={() => handleDeleteCategory(item.id, item.title)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 rounded text-red-400 text-xs font-semibold transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="p-4 border-t border-[#2C2C2C] flex items-center justify-between bg-[#151515]">
                <span className="text-xs text-gray-400">
                  Showing page <strong className="text-gray-200">{page}</strong> of <strong className="text-gray-200">{totalPages}</strong> (Total <strong className="text-gray-200">{totalCount}</strong>)
                </span>
                <div className="flex items-center gap-2">
                  <button 
                    disabled={page <= 1}
                    onClick={() => loadCategories(page - 1, searchQuery, selectedLang, isAudioFilter)}
                    className="p-1.5 bg-[#1E1E1E] border border-[#2C2C2C] rounded-lg disabled:opacity-40 hover:bg-neutral-800 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button 
                    disabled={page >= totalPages}
                    onClick={() => loadCategories(page + 1, searchQuery, selectedLang, isAudioFilter)}
                    className="p-1.5 bg-[#1E1E1E] border border-[#2C2C2C] rounded-lg disabled:opacity-40 hover:bg-neutral-800 transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: DEITIES (Spiritual Management Vidhanam — Gods / Goddesses) */}
          {activeTab === 'deities' && <DeityManager />}

          {/* TAB 2: SUBCATEGORIES */}
          {activeTab === 'subcategories' && (
            <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] overflow-hidden space-y-0">
              <div className="p-5 border-b border-[#2C2C2C] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-gray-100 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-orange-400" />
                    <span>Devotional Subcategories & Chapters (Multi-Level)</span>
                  </h2>
                  <p className="text-xs text-gray-400">Manage Pooja rituals (Level 2) and drill-down chapters / Vratha Kathalu (Level 3).</p>
                </div>
                <div className="flex items-center gap-3">
                  <select 
                    value={selectedLang}
                    onChange={(e) => {
                      setSelectedLang(e.target.value);
                      loadSubcategories(1, searchQuery, e.target.value);
                      loadParentLookup(e.target.value);
                    }}
                    className="bg-[#141414] border border-[#2C2C2C] rounded-lg px-3 py-2 text-xs text-amber-400 focus:outline-none focus:border-[#FFB300]"
                  >
                    <option value="te">Telugu (తెలుగు)</option>
                    <option value="kn">Kannada (ಕನ್ನಡ)</option>
                    <option value="en">English</option>
                    <option value="ta">Tamil (தமிழ்)</option>
                    <option value="hi">Hindi (हिन्दी)</option>
                  </select>
                  <button 
                    onClick={handleOpenCreateSubcategory}
                    className="flex items-center gap-2 bg-[#D84315] hover:bg-[#BF360C] text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow-md shadow-orange-950"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Subcategory / Chapter</span>
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto min-h-[300px]">
                {subcategories.length === 0 ? (
                  <div className="p-12 text-center text-xs text-gray-400">
                    <p className="font-semibold text-gray-300">No child subcategories or chapters found.</p>
                    <p className="text-gray-500 mt-1">Click "+ Create Subcategory / Chapter" to assign a ritual or chapter under any category or Vratham.</p>
                  </div>
                ) : (
                  <table className="w-full text-left text-xs text-gray-300">
                    <thead className="bg-[#181818] uppercase text-gray-400 border-b border-[#2C2C2C]">
                      <tr>
                        <th className="px-6 py-3">ID</th>
                        <th className="px-6 py-3">Subcategory / Chapter Title</th>
                        <th className="px-6 py-3">Parent Section</th>
                        <th className="px-6 py-3">Slug</th>
                        <th className="px-6 py-3 text-center font-bold text-amber-400">Options / Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2C2C2C]">
                      {subcategories.map(sub => (
                        <tr key={sub.id} className="hover:bg-neutral-800/40">
                          <td className="px-6 py-4 font-mono text-gray-500">#{sub.id}</td>
                          <td className="px-6 py-4 font-semibold text-gray-100 flex items-center gap-2">
                            <span className="text-orange-400">🪔</span>
                            <span>{sub.title}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 rounded bg-orange-950/40 text-orange-400 border border-orange-800/40 text-xs font-semibold">
                              {sub.parentTitle}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono text-amber-400">{sub.slug}</td>
                          <td className="px-6 py-4 text-center space-x-2 whitespace-nowrap">
                            <button 
                              onClick={() => handleOpenViewCategory(sub.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded text-sky-400 text-xs font-semibold transition"
                              title="View Subcategory Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View</span>
                            </button>
                            <button 
                              onClick={() => handleOpenEditSubcategory(sub)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded text-amber-400 text-xs font-semibold transition"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            <button 
                              onClick={() => handleDeleteSubcategory(sub.id, sub.title)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 rounded text-red-400 text-xs font-semibold transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: DEVOTIONAL CONTENT */}
          {activeTab === 'content' && (
            <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] overflow-hidden">
              <div className="p-5 border-b border-[#2C2C2C] flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-gray-100">Devotional Sacred Text & Verses</h2>
                  <p className="text-xs text-gray-400">Manage individual Stotras, Mantras, Slokas, and poetic lines.</p>
                </div>
                <button 
                  onClick={handleOpenCreateContent}
                  className="flex items-center gap-2 bg-[#D84315] hover:bg-[#BF360C] text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow-md shadow-orange-950"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Sacred Verse</span>
                </button>
              </div>
              <div className="overflow-x-auto min-h-[300px]">
                {devotionalContent.length === 0 ? (
                  <div className="p-12 text-center text-xs text-gray-400">
                    <p className="font-semibold text-gray-300">No standalone verse items in `devotional_contents` table yet.</p>
                    <p className="text-gray-500 mt-1">Click "+ Add Sacred Verse" to create individual verse recitations and meanings.</p>
                  </div>
                ) : (
                  <table className="w-full text-left text-xs text-gray-300">
                    <thead className="bg-[#181818] uppercase text-gray-400 border-b border-[#2C2C2C]">
                      <tr>
                        <th className="px-6 py-3">ID</th>
                        <th className="px-6 py-3">Title</th>
                        <th className="px-6 py-3">Sacred Verse</th>
                        <th className="px-6 py-3">Spiritual Meaning</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2C2C2C]">
                      {devotionalContent.map(item => (
                        <tr key={item.id} className="hover:bg-neutral-800/40">
                          <td className="px-6 py-4 font-mono">#{item.id}</td>
                          <td className="px-6 py-4 font-semibold text-gray-100">{item.title}</td>
                          <td className="px-6 py-4 font-mono text-amber-300 max-w-xs truncate">{item.sacredText || '—'}</td>
                          <td className="px-6 py-4 text-gray-400 max-w-xs truncate">{item.meaning || '—'}</td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => handleDeleteContent(item.id, item.title)}
                              className="p-1.5 hover:bg-neutral-700 rounded text-red-400 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: PANCHANGAM & FESTIVALS */}
          {activeTab === 'panchangam' && (
            <div className="space-y-6">
              {/* Live Vedic Astronomical Panchangam Card */}
              <div className="bg-[#1C1C1C] rounded-xl border border-[#FFB300]/30 p-6 shadow-xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2C2C2C] pb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🕉️</span>
                    <div>
                      <h2 className="text-base font-bold text-[#FFB300] tracking-wide">
                        Live Vedic Astronomical Panchangam
                      </h2>
                      <p className="text-xs text-gray-400">
                        Jean Meeus VSOP87 & Lahiri Chitra Paksha High-Precision Engine
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <select
                      value={panchangamCity}
                      onChange={(e) => {
                        setPanchangamCity(e.target.value);
                        loadPanchangam(e.target.value, selectedLang);
                      }}
                      className="bg-[#121212] border border-[#2C2C2C] rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-[#FFB300]"
                    >
                      <option value="Hyderabad">Hyderabad (హైదరాబాద్)</option>
                      <option value="Vijayawada">Vijayawada (విజయవాడ)</option>
                      <option value="Visakhapatnam">Visakhapatnam (విశాఖపట్నం)</option>
                      <option value="Tirupati">Tirupati (తిరుపతి)</option>
                      <option value="Bengaluru">Bengaluru (ಬೆಂಗಳೂರು)</option>
                      <option value="Chennai">Chennai (சென்னை)</option>
                      <option value="Sabarimala">Sabarimala (ശബരിമല)</option>
                    </select>

                    <button
                      onClick={() => loadPanchangam(panchangamCity, selectedLang)}
                      className="p-1.5 hover:bg-neutral-800 rounded-lg text-gray-400 hover:text-amber-400 transition"
                      title="Recalculate Astronomical Ephemeris"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {livePanchangam ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                    <div className="bg-[#141414] p-3 rounded-lg border border-[#2C2C2C]">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Date & Weekday</p>
                      <p className="text-xs font-bold text-gray-100 mt-1">{livePanchangam.isoDate}</p>
                      <p className="text-xs font-semibold text-amber-400">{livePanchangam.vaaram}</p>
                    </div>

                    <div className="bg-[#141414] p-3 rounded-lg border border-[#2C2C2C]">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Samvatsara & Maasa</p>
                      <p className="text-xs font-bold text-gray-100 mt-1 truncate">{livePanchangam.samvatsaram}</p>
                      <p className="text-xs font-semibold text-orange-400">{livePanchangam.maasa} • {livePanchangam.paksham}</p>
                    </div>

                    <div className="bg-[#141414] p-3 rounded-lg border border-[#2C2C2C]">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Tithi & Nakshatram</p>
                      <p className="text-xs font-bold text-emerald-400 mt-1">Tithi: {livePanchangam.tithi} ({livePanchangam.tithiEndTime})</p>
                      <p className="text-xs font-semibold text-sky-400">Nakshatra: {livePanchangam.nakshatram}</p>
                    </div>

                    <div className="bg-[#141414] p-3 rounded-lg border border-[#2C2C2C]">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Sun & Timings</p>
                      <p className="text-xs text-amber-300 mt-1">☀️ {livePanchangam.sunrise} — 🌙 {livePanchangam.sunset}</p>
                      <p className="text-[11px] text-red-400">Rahu: {livePanchangam.rahuKalam}</p>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-gray-500">
                    Loading high-precision ephemeris data...
                  </div>
                )}
              </div>

              {/* Sabarimala Festival Dates */}
              <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] overflow-hidden">
                <div className="p-5 border-b border-[#2C2C2C] flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-gray-100">Sabarimala Festivals & Observance Dates</h2>
                    <p className="text-xs text-gray-400">Managed in MySQL database with multilingual translations.</p>
                  </div>
                  <button 
                    onClick={handleOpenCreateFestival}
                    className="flex items-center gap-2 bg-[#D84315] hover:bg-[#BF360C] text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow-md shadow-orange-950"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Festival</span>
                  </button>
                </div>
                <div className="overflow-x-auto min-h-[250px]">
                  {festivals.length === 0 ? (
                    <div className="p-12 text-center text-xs text-gray-400">
                      <p className="font-semibold text-gray-300">No festival entries found in database.</p>
                      <p className="text-gray-500 mt-1">Click "+ Create Festival" to add verified Sabarimala Mandala Kalam or Makara Jyothi dates.</p>
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs text-gray-300">
                      <thead className="bg-[#181818] uppercase text-gray-400 border-b border-[#2C2C2C]">
                        <tr>
                          <th className="px-6 py-3">ID</th>
                          <th className="px-6 py-3">Festival Name</th>
                          <th className="px-6 py-3">Annual Date</th>
                          <th className="px-6 py-3">Source Note</th>
                          <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2C2C2C]">
                        {festivals.map(f => {
                          const langMatch = f.translations?.find(t => (t as any).language?.code === selectedLang) 
                            || f.translations?.find(t => (t as any).language?.code === 'te')
                            || f.translations?.[0];
                          return (
                            <tr key={f.id} className="hover:bg-neutral-800/40">
                              <td className="px-6 py-4 font-mono text-gray-400">#{f.id}</td>
                              <td className="px-6 py-4 font-semibold text-gray-100">{langMatch?.name || f.slug}</td>
                              <td className="px-6 py-4 font-mono text-amber-400">{new Date(f.festivalDate).toLocaleDateString()}</td>
                              <td className="px-6 py-4 text-gray-400">{f.sourceNote || 'Sabarimala Devaswom Board'}</td>
                              <td className="px-6 py-4 text-right">
                                <button 
                                  onClick={() => handleDeleteFestival(f.id)}
                                  className="p-1.5 hover:bg-neutral-700 rounded text-red-400 transition"
                                  title="Delete Festival Record"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: AUDIO LIBRARY */}
          {activeTab === 'audio' && (
            <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] overflow-hidden">
              <div className="p-5 border-b border-[#2C2C2C] flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-gray-100">Devotional Audio Library</h2>
                  <p className="text-xs text-gray-400">Offline persistent chants (Suprabatham, Harivarasanam, etc.).</p>
                </div>
                <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-[#FFB300] rounded-full text-xs font-semibold">
                  {audioList.length} Tracks in Database
                </span>
              </div>
              <div className="overflow-x-auto min-h-[300px]">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="bg-[#181818] uppercase text-gray-400 border-b border-[#2C2C2C]">
                    <tr>
                      <th className="px-6 py-3">ID</th>
                      <th className="px-6 py-3">Audio Title</th>
                      <th className="px-6 py-3">Slug Identifier</th>
                      <th className="px-6 py-3">Duration</th>
                      <th className="px-6 py-3">Offline Download Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2C2C2C]">
                    {audioList.map(a => (
                      <tr key={a.id} className="hover:bg-neutral-800/40">
                        <td className="px-6 py-4 font-mono">#{a.id}</td>
                        <td className="px-6 py-4 font-semibold text-gray-100 flex items-center gap-2">
                          <Music className="w-3.5 h-3.5 text-amber-400" />
                          <span>{a.title}</span>
                        </td>
                        <td className="px-6 py-4 font-mono text-amber-400">{a.slug}</td>
                        <td className="px-6 py-4 font-mono">{a.duration}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                            OFFLINE_ENABLED
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: CMS PAGES (WITH SUBTITLE TABS & DYNAMIC REAL-TIME EDITOR) */}
          {activeTab === 'cms' && (
            <div className="space-y-6">
              {/* Sub-Title Selector Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {[
                  { key: 'about_us', label: 'About Us', icon: BookOpen, desc: 'Mission & History' },
                  { key: 'terms_conditions', label: 'Terms & Conditions', icon: ShieldCheck, desc: 'Devotee Agreement' },
                  { key: 'privacy_policy', label: 'Privacy Policy', icon: Lock, desc: 'Data & Privacy' },
                  { key: 'refund_policy', label: 'Refund Policy', icon: CheckCircle2, desc: 'Donation & Offerings' },
                  { key: 'sabarimala_guidelines', label: 'Sabarimala Guidelines', icon: FileText, desc: 'Pilgrim Rules' },
                ].map(item => {
                  const isSelected = selectedCmsKey === item.key;
                  const SubIcon = item.icon;
                  return (
                    <button
                      key={item.key}
                      onClick={() => setSelectedCmsKey(item.key)}
                      className={`p-4 rounded-xl border transition-all text-left flex items-start gap-3.5 ${
                        isSelected
                          ? 'bg-[#1C1C1C] border-[#FFB300] shadow-lg shadow-amber-950/30'
                          : 'bg-[#181818] border-[#2C2C2C] hover:border-neutral-600 hover:bg-[#1E1E1E]'
                      }`}
                    >
                      <div className={`p-2.5 rounded-lg ${isSelected ? 'bg-orange-500/20 text-[#FFB300] border border-orange-500/40' : 'bg-neutral-800 text-gray-400'}`}>
                        <SubIcon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-bold uppercase tracking-wide truncate ${isSelected ? 'text-[#FFB300]' : 'text-gray-200'}`}>
                          {item.label}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate mt-0.5">{item.desc}</p>
                        <span className="inline-block mt-2 font-mono text-[9px] px-2 py-0.5 rounded bg-black/40 text-amber-300/80 border border-neutral-700">
                          {item.key}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic CMS Page Editor */}
              <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] overflow-hidden shadow-xl">
                <div className="p-5 border-b border-[#2C2C2C] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-orange-400" />
                      <h2 className="text-base font-bold text-gray-100">
                        Editing CMS Page: <span className="text-[#FFB300]">{cmsEditTitle || selectedCmsKey}</span>
                      </h2>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Updates are stored live in MySQL table <code className="text-amber-400">app_settings</code> and served dynamically to mobile apps via API.
                    </p>
                  </div>
                  <button
                    onClick={handleSaveCmsPage}
                    disabled={isSavingCms}
                    className="flex items-center gap-2 bg-[#D84315] hover:bg-[#BF360C] disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition shadow-md shadow-orange-950"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isSavingCms ? 'Saving to MySQL...' : 'Save to Database'}</span>
                  </button>
                </div>

                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                        Database Key (Read Only Identifier)
                      </label>
                      <input
                        type="text"
                        value={selectedCmsKey}
                        disabled
                        className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3.5 py-2 text-xs font-mono text-amber-300 cursor-not-allowed opacity-80"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                        Page Title & Sub-Heading
                      </label>
                      <input
                        type="text"
                        value={cmsEditTitle}
                        onChange={(e) => setCmsEditTitle(e.target.value)}
                        placeholder="e.g. About Saranam Ayyappa Devotional Platform"
                        className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3.5 py-2 text-xs text-gray-100 focus:outline-none focus:border-[#FFB300]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                      Page Content Body (Formatted Devotional / Legal Text)
                    </label>
                    <textarea
                      rows={14}
                      value={cmsEditContent}
                      onChange={(e) => setCmsEditContent(e.target.value)}
                      placeholder="Write or edit full CMS page text..."
                      className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg p-3.5 text-xs text-gray-200 focus:outline-none focus:border-[#FFB300] leading-relaxed font-sans"
                    />
                  </div>
                </div>

                {/* Table of all active CMS records */}
                <div className="border-t border-[#2C2C2C]">
                  <div className="px-6 py-3 bg-[#181818] border-b border-[#2C2C2C] flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-300 uppercase">
                      MySQL Database Status (<code className="text-amber-400">app_settings</code>)
                    </span>
                    <button
                      onClick={loadCms}
                      className="text-xs text-gray-400 hover:text-amber-400 flex items-center gap-1.5 transition"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Reload from DB</span>
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-300">
                      <thead className="bg-[#151515] uppercase text-[11px] text-gray-400 border-b border-[#2C2C2C]">
                        <tr>
                          <th className="px-6 py-2.5">Key</th>
                          <th className="px-6 py-2.5">Title / Description</th>
                          <th className="px-6 py-2.5">Content Preview</th>
                          <th className="px-6 py-2.5">Last Synchronized</th>
                          <th className="px-6 py-2.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2C2C2C]">
                        {cmsPages.map(p => (
                          <tr
                            key={p.id}
                            className={`hover:bg-neutral-800/40 cursor-pointer ${
                              selectedCmsKey === p.key ? 'bg-orange-500/10' : ''
                            }`}
                            onClick={() => setSelectedCmsKey(p.key)}
                          >
                            <td className="px-6 py-3 font-mono text-amber-400 font-semibold">{p.key}</td>
                            <td className="px-6 py-3 text-gray-200 font-medium">{p.description || p.key}</td>
                            <td className="px-6 py-3 text-gray-400 max-w-xs truncate">{p.value || 'â€”'}</td>
                            <td className="px-6 py-3 text-gray-400">{new Date(p.updatedAt).toLocaleString()}</td>
                            <td className="px-6 py-3 text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCmsKey(p.key);
                                }}
                                className="px-2.5 py-1 rounded bg-[#D84315]/20 hover:bg-[#D84315]/40 text-[#FFB300] font-semibold text-[11px] transition"
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: LANGUAGES */}
          {activeTab === 'languages' && (
            <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] overflow-hidden">
              <div className="p-5 border-b border-[#2C2C2C] flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-gray-100">All 5 Languages in MySQL Database</h2>
                  <p className="text-xs text-gray-400">Create, edit, or manage supported devotional languages.</p>
                </div>
                <button 
                  onClick={handleOpenCreateLanguage}
                  className="flex items-center gap-2 bg-[#D84315] hover:bg-[#BF360C] text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow-md shadow-orange-950"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Language</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="bg-[#181818] uppercase text-gray-400 border-b border-[#2C2C2C]">
                    <tr>
                      <th className="px-6 py-3">Language ID</th>
                      <th className="px-6 py-3">Name</th>
                      <th className="px-6 py-3">Native</th>
                      <th className="px-6 py-3">ISO Code</th>
                      <th className="px-6 py-3">Translations in DB</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-center font-bold text-amber-400">Options / Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2C2C2C]">
                    {languages.map(l => (
                      <tr key={l.code} className="hover:bg-neutral-800/40">
                        <td className="px-6 py-4 font-mono text-gray-500">#{l.id}</td>
                        <td className="px-6 py-4 font-semibold text-gray-100">{l.name}</td>
                        <td className="px-6 py-4 text-orange-400 font-semibold text-sm">{l.nativeName}</td>
                        <td className="px-6 py-4 font-mono text-amber-400">{l.code}</td>
                        <td className="px-6 py-4 font-semibold text-emerald-400">{l.translationCount || 0} records</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                            ACTIVE
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center space-x-2 whitespace-nowrap">
                          <button 
                            onClick={() => handleOpenEditLanguage(l)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded text-amber-400 text-xs font-semibold transition"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button 
                            onClick={() => handleDeleteLanguage(l.id, l.name)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 rounded text-red-400 text-xs font-semibold transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 8: USER MANAGEMENT & DELETION REQUESTS */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              {/* Sub-tab Navigation */}
              <div className="flex items-center gap-3 bg-[#1E1E1E] p-3 rounded-xl border border-[#2C2C2C]">
                <button
                  onClick={() => { setUserSubTab('all'); setSelectedUserSubtitle('devotees'); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                    userSubTab === 'all' && selectedUserSubtitle === 'devotees'
                      ? 'bg-[#FFB300] text-black shadow-lg shadow-amber-950/20'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-[#252525]'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Devotees ({users.filter(u => !u.isDeleted).length})</span>
                </button>
                <button
                  onClick={() => { setUserSubTab('all'); setSelectedUserSubtitle('dharma_karthas'); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                    userSubTab === 'all' && selectedUserSubtitle === 'dharma_karthas'
                      ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/20'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-[#252525]'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Dharma Karthas</span>
                </button>
                <button
                  onClick={() => setUserSubTab('requests')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all relative ${
                    userSubTab === 'requests'
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/20'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-[#252525]'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 text-amber-300" />
                  <span>Deletion Requests ({deletionRequests.length})</span>
                  {deletionRequests.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-red-500 text-white font-bold rounded-full animate-pulse">
                      {deletionRequests.length}
                    </span>
                  )}
                </button>
              </div>

              {/* View 1: Pending Deletion Requests */}
              {userSubTab === 'requests' && (
                <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] overflow-hidden">
                  <div className="p-5 border-b border-[#2C2C2C] flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-400" />
                        <h2 className="text-base font-bold text-gray-100">Devotee Account Deletion Requests</h2>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Devotees who verified their mobile OTP and submitted an account deletion request. Choose to soft-delete (deactivate) or permanently purge.
                      </p>
                    </div>
                    <button
                      onClick={() => { loadDeletionRequests(); loadUsers(); }}
                      className="flex items-center gap-2 px-3 py-1.5 bg-[#252525] hover:bg-[#2F2F2F] text-xs font-semibold rounded-lg text-gray-300 border border-[#3C3C3C] transition"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Refresh</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    {deletionRequests.length === 0 ? (
                      <div className="p-12 text-center text-xs text-gray-400 space-y-2">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <p className="font-semibold text-gray-200">No Pending Account Deletion Requests</p>
                        <p className="text-gray-500">All registered devotee accounts are in good standing.</p>
                      </div>
                    ) : (
                      <table className="w-full text-left text-xs text-gray-300">
                        <thead className="bg-[#181818] uppercase text-gray-400 border-b border-[#2C2C2C]">
                          <tr>
                            <th className="px-6 py-3">User ID</th>
                            <th className="px-6 py-3">Devotee / Identifier</th>
                            <th className="px-6 py-3">Request Date</th>
                            <th className="px-6 py-3">Deletion Reason</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Admin Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2C2C2C]">
                          {deletionRequests.map(u => (
                            <tr key={u.id} className="hover:bg-neutral-800/40">
                              <td className="px-6 py-4 font-mono text-gray-500">#{u.id}</td>
                              <td className="px-6 py-4">
                                <p className="font-semibold text-gray-100">{u.fullName || 'Devotee'}</p>
                                <p className="text-[11px] font-mono text-gray-400">{u.phoneNumber || u.deviceUuid || 'No phone'}</p>
                              </td>
                              <td className="px-6 py-4 text-gray-300">
                                {u.deletionRequestedAt ? new Date(u.deletionRequestedAt).toLocaleString() : 'Recent'}
                              </td>
                              <td className="px-6 py-4 max-w-xs">
                                <span className="bg-[#2A2421] text-amber-300 border border-amber-900/40 px-2.5 py-1 rounded text-[11px] block truncate" title={u.deletionReason || 'No reason provided'}>
                                  {u.deletionReason || 'No reason provided by devotee'}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse">
                                  DELETION REQUESTED
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleSoftDeleteUser(u.id, u.fullName || u.phoneNumber)}
                                    disabled={actionLoadingId === u.id}
                                    className="px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-600/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                                    title="Deactivate account & move to Soft-Deleted archive"
                                  >
                                    <Archive className="w-3.5 h-3.5" />
                                    <span>Soft Delete</span>
                                  </button>
                                  <button
                                    onClick={() => handlePermanentDeleteUser(u.id, u.fullName || u.phoneNumber)}
                                    disabled={actionLoadingId === u.id}
                                    className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-600/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                                    title="Permanently erase from MySQL database"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Permanent Delete</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

              {/* View 2: Dharma Karthas Temple Verification Screen */}
              {userSubTab === 'all' && selectedUserSubtitle === 'dharma_karthas' && (
                <DharmaKarthaManager apiBaseUrl={API_BASE_URL} onNotification={setNotification} />
              )}

              {/* View 3: All Active Registered Devotees */}
              {userSubTab === 'all' && selectedUserSubtitle === 'devotees' && (
                <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] overflow-hidden">
                  <div className="p-5 border-b border-[#2C2C2C] flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-gray-100">Registered App Users (MySQL `app_users`)</h2>
                      <p className="text-xs text-gray-400">Active devotee profiles queried directly from MySQL via Prisma.</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    {users.filter(u => !u.isDeleted).length === 0 ? (
                      <div className="p-12 text-center text-xs text-gray-400 space-y-2">
                        <p className="font-semibold text-gray-300">No active registered mobile user profiles yet.</p>
                      </div>
                    ) : (
                      <table className="w-full text-left text-xs text-gray-300">
                        <thead className="bg-[#181818] uppercase text-gray-400 border-b border-[#2C2C2C]">
                          <tr>
                            <th className="px-6 py-3">User ID</th>
                            <th className="px-6 py-3">Phone / Identifier</th>
                            <th className="px-6 py-3">Language</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Registered At</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2C2C2C]">
                          {users.filter(u => !u.isDeleted).map(u => (
                            <tr key={u.id} className="hover:bg-neutral-800/40">
                              <td className="px-6 py-4 font-mono text-gray-500">#{u.id}</td>
                              <td className="px-6 py-4 font-semibold text-gray-100">
                                {u.fullName ? `${u.fullName} (${u.phoneNumber || u.deviceUuid})` : u.phoneNumber || u.deviceUuid || 'Anonymous Client'}
                              </td>
                              <td className="px-6 py-4 uppercase font-mono text-amber-400">{u.preferredLang}</td>
                              <td className="px-6 py-4">
                                {u.deletionRequested ? (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                    DELETION REQUESTED
                                  </span>
                                ) : (
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.isSuspended ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                                    {u.isSuspended ? 'SUSPENDED' : 'ACTIVE'}
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleSoftDeleteUser(u.id, u.fullName || u.phoneNumber)}
                                    disabled={actionLoadingId === u.id}
                                    className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded text-[11px] font-semibold flex items-center gap-1 transition"
                                  >
                                    <Archive className="w-3 h-3" />
                                    <span>Soft Delete</span>
                                  </button>
                                  <button
                                    onClick={() => handlePermanentDeleteUser(u.id, u.fullName || u.phoneNumber)}
                                    disabled={actionLoadingId === u.id}
                                    className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded text-[11px] font-semibold flex items-center gap-1 transition"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* DEDICATED SEPARATE PAGE: SOFT DELETED USERS */}
          {activeTab === 'soft_deleted_users' && (
            <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] overflow-hidden">
              <div className="p-5 border-b border-[#2C2C2C] flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <UserX className="w-5 h-5 text-rose-400" />
                    <h2 className="text-base font-bold text-gray-100">Soft-Deleted Devotee Accounts (`is_deleted = true`)</h2>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Archived accounts prevented from accessing the app. Devotee data is retained in MySQL for audit and compliance. You can restore access or permanently purge anytime.
                  </p>
                </div>
                <button
                  onClick={() => { loadSoftDeletedUsers(); loadUsers(); }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#252525] hover:bg-[#2F2F2F] text-xs font-semibold rounded-lg text-gray-300 border border-[#3C3C3C] transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh List</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                {softDeletedUsers.length === 0 ? (
                  <div className="p-12 text-center text-xs text-gray-400 space-y-2">
                    <div className="w-12 h-12 rounded-full bg-neutral-800 border border-neutral-700 text-gray-400 flex items-center justify-center mx-auto mb-2">
                      <UserX className="w-6 h-6" />
                    </div>
                    <p className="font-semibold text-gray-200">No Soft-Deleted User Accounts</p>
                    <p className="text-gray-500">There are currently no accounts in the soft-deleted archive.</p>
                  </div>
                ) : (
                  <table className="w-full text-left text-xs text-gray-300">
                    <thead className="bg-[#181818] uppercase text-gray-400 border-b border-[#2C2C2C]">
                      <tr>
                        <th className="px-6 py-3">User ID</th>
                        <th className="px-6 py-3">Devotee / Identifier</th>
                        <th className="px-6 py-3">Language</th>
                        <th className="px-6 py-3">Deactivated Date</th>
                        <th className="px-6 py-3">Deletion Reason</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2C2C2C]">
                      {softDeletedUsers.map(u => (
                        <tr key={u.id} className="hover:bg-neutral-800/40">
                          <td className="px-6 py-4 font-mono text-gray-500">#{u.id}</td>
                          <td className="px-6 py-4">
                            <p className="font-semibold text-gray-100">{u.fullName || 'Devotee'}</p>
                            <p className="text-[11px] font-mono text-gray-400">{u.phoneNumber || u.deviceUuid || 'No phone'}</p>
                          </td>
                          <td className="px-6 py-4 uppercase font-mono text-amber-400">{u.preferredLang}</td>
                          <td className="px-6 py-4 text-gray-300">
                            {u.deletedAt ? new Date(u.deletedAt).toLocaleString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 max-w-xs">
                            <span className="text-gray-400 italic block truncate" title={u.deletionReason || 'Direct admin soft-delete'}>
                              {u.deletionReason || 'Direct admin soft-delete'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              SOFT DELETED
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleRestoreUser(u.id, u.fullName || u.phoneNumber)}
                                disabled={actionLoadingId === u.id}
                                className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-600/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                                title="Reactivate devotee account"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Restore Account</span>
                              </button>
                              <button
                                onClick={() => handlePermanentDeleteUser(u.id, u.fullName || u.phoneNumber)}
                                disabled={actionLoadingId === u.id}
                                className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-600/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                                title="Permanently erase from MySQL database"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Permanent Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* TAB 9: DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#1E1E1E] p-4 rounded-xl border border-[#2C2C2C]">
                  <p className="text-xs text-gray-400 font-medium">Registered App Users</p>
                  <p className="text-2xl font-bold text-gray-100 mt-1">{users.length}</p>
                  <span className="text-[10px] text-emerald-400 font-semibold">Real MySQL app_users</span>
                </div>
                <div className="bg-[#1E1E1E] p-4 rounded-xl border border-[#2C2C2C]">
                  <p className="text-xs text-gray-400 font-medium">Active Categories</p>
                  <p className="text-2xl font-bold text-[#FFB300] mt-1">{stats?.activeCategories || 109}</p>
                  <span className="text-[10px] text-emerald-400 font-semibold">Strict server-side paginated</span>
                </div>
                <div className="bg-[#1E1E1E] p-4 rounded-xl border border-[#2C2C2C]">
                  <p className="text-xs text-gray-400 font-medium">Languages in DB</p>
                  <p className="text-2xl font-bold text-emerald-400 mt-1">{languages.length || 5}</p>
                  <span className="text-[10px] text-emerald-400 font-semibold">te, kn, en, ta, hi active</span>
                </div>
                <div className="bg-[#1E1E1E] p-4 rounded-xl border border-[#2C2C2C]">
                  <p className="text-xs text-gray-400 font-medium">Recorded Audit Logs</p>
                  <p className="text-2xl font-bold text-orange-400 mt-1">{auditLogs.length}</p>
                  <span className="text-[10px] text-orange-400 font-semibold">Tamper-evident log trail</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: ADMIN PROFILE */}
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] p-6 space-y-4">
                <h2 className="text-base font-bold text-gray-100 flex items-center gap-2">
                  <User className="w-5 h-5 text-orange-400" />
                  <span>Master Administrator Profile</span>
                </h2>
                <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-gray-400 uppercase mb-1">Email (Identity)</label>
                    <input 
                      type="text" 
                      value={adminProfile.email} 
                      disabled
                      className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3 py-2 text-gray-400 cursor-not-allowed font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-300 uppercase mb-1">Full Name</label>
                    <input 
                      type="text" 
                      value={editFullName} 
                      onChange={(e) => setEditFullName(e.target.value)}
                      className="w-full bg-[#141414] border border-[#2C2C2C] rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-[#FFB300]"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="bg-[#D84315] hover:bg-[#BF360C] text-white px-4 py-2 rounded-lg font-semibold transition"
                  >
                    Save Profile Changes
                  </button>
                </form>
              </div>

              <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] p-6 space-y-4">
                <h2 className="text-base font-bold text-gray-100 flex items-center gap-2">
                  <Key className="w-5 h-5 text-emerald-400" />
                  <span>Rotate Password (Bcrypt Salt 12)</span>
                </h2>
                <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-gray-300 uppercase mb-1">Current Password</label>
                    <input 
                      type="password" 
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className="w-full bg-[#141414] border border-[#2C2C2C] rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-[#FFB300]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-300 uppercase mb-1">New Password</label>
                    <input 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="w-full bg-[#141414] border border-[#2C2C2C] rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-[#FFB300]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-300 uppercase mb-1">Confirm New Password</label>
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full bg-[#141414] border border-[#2C2C2C] rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-[#FFB300]"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-semibold transition"
                  >
                    Rotate Password Securely
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 11: SETTINGS & TICKER */}
          {activeTab === 'settings' && (
            <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] p-6 space-y-4">
              <h2 className="text-base font-bold text-[#FFB300] flex items-center gap-2">
                <Radio className="w-5 h-5 text-orange-400" />
                <span>Devotional Marquee Announcement Ticker</span>
              </h2>
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-2">Live Announcement Text</label>
                <textarea 
                  rows={4}
                  value={tickerText}
                  onChange={(e) => setTickerText(e.target.value)}
                  className="w-full bg-[#141414] border border-[#2C2C2C] rounded-lg p-3 text-xs text-gray-100 focus:outline-none focus:border-[#FFB300]"
                />
              </div>
              <div className="pt-2">
                <button 
                  onClick={handleSaveTicker}
                  className="bg-[#D84315] hover:bg-[#BF360C] text-white px-5 py-2.5 rounded-lg text-xs font-semibold transition"
                >
                  Save & Publish Live Ticker to MySQL
                </button>
              </div>
            </div>
          )}

          {/* TAB 12: AUDIT LOGS */}
          {activeTab === 'audit' && (
            <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] overflow-hidden">
              <div className="p-5 border-b border-[#2C2C2C] flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-gray-100">Tamper-Evident Admin Audit Trail</h2>
                  <p className="text-xs text-gray-400">All administrative operations recorded in MySQL `admin_audit_logs`.</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="bg-[#181818] uppercase text-gray-400 border-b border-[#2C2C2C]">
                    <tr>
                      <th className="px-6 py-3">Timestamp</th>
                      <th className="px-6 py-3">Admin</th>
                      <th className="px-6 py-3">Action</th>
                      <th className="px-6 py-3">Target</th>
                      <th className="px-6 py-3">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2C2C2C]">
                    {auditLogs.map(log => (
                      <tr key={log.id} className="hover:bg-neutral-800/40">
                        <td className="px-6 py-4 font-mono text-gray-500 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                        <td className="px-6 py-4 font-semibold text-gray-200">{log.admin?.fullName || 'System Master'}</td>
                        <td className="px-6 py-4 font-mono text-orange-400">{log.action}</td>
                        <td className="px-6 py-4">{log.targetType} {log.targetId ? `#${log.targetId}` : ''}</td>
                        <td className="px-6 py-4 text-gray-400 max-w-xs truncate">{log.detailsJson || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal Dialog for Category Create / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1C1C1C] border border-[#FFB300]/40 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-[#FFB300] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-400" />
              <span>{editingId ? 'Edit Devotional Category' : 'Create New Devotional Category'}</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-300 uppercase mb-1">Category Title ({selectedLang.toUpperCase()})</label>
                <input 
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. శ్రీ అయ్యప్ప శరణు ఘోష"
                  className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-[#FFB300]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-300 uppercase mb-1">URL Identifier (Slug)</label>
                <input 
                  type="text"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  placeholder="e.g. daily-pooja"
                  className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-[#FFB300]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-300 uppercase mb-1">Content Type</label>
                <select 
                  value={formIsAudio ? 'true' : 'false'}
                  onChange={(e) => setFormIsAudio(e.target.value === 'true')}
                  className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-[#FFB300]"
                >
                  <option value="false">Text & Devotional Slokas (Readable)</option>
                  <option value="true">Audio Track (Sing-along & Chant)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-300 uppercase mb-1">Description</label>
                <textarea 
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Brief spiritual summary of this sacred section..."
                  className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-[#FFB300]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2C2C2C]">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs text-gray-400 hover:text-gray-200 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveCategory}
                className="bg-[#D84315] hover:bg-[#BF360C] text-white px-5 py-2 rounded-lg text-xs font-semibold transition shadow-md shadow-orange-950"
              >
                Save Category to MySQL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog for Subcategory / Chapter Create & Edit (Multi-Level Hierarchy) */}
      {isSubModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1C1C1C] border border-orange-500/50 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-[#FFB300] flex items-center gap-2">
              <Layers className="w-5 h-5 text-orange-400" />
              <span>{editingSubId ? 'Edit Subcategory / Chapter' : 'Create Subcategory or Chapter'}</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-300 uppercase mb-1">
                  Select Parent Category or Vratham (Hierarchy Target)
                </label>
                <select 
                  value={subFormParentId}
                  onChange={(e) => setSubFormParentId(Number(e.target.value))}
                  className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3 py-2 text-amber-300 focus:outline-none focus:border-[#FFB300]"
                >
                  <option value="">-- Choose Parent (e.g. Poojalu Vrathaalu, Satyanarayana Swamy, etc.) --</option>
                  {parentLookupList.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.parentId ? `└── [Sub-Level] ${p.title} (#${p.id})` : `[Main Category] ${p.title} (#${p.id})`}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-400 mt-1">
                  To create Level 2 (e.g. <i>Varalakshmi Vratham</i>), pick <b>Poojalu Vrathaalu</b>. To create Level 3 (e.g. <i>Chapter 1</i> or <i>Katha</i>), pick that Vratham!
                </p>
              </div>

              <div>
                <label className="block font-semibold text-gray-300 uppercase mb-1">
                  Subcategory / Chapter Title ({selectedLang.toUpperCase()})
                </label>
                <input 
                  type="text"
                  value={subFormTitle}
                  onChange={(e) => setSubFormTitle(e.target.value)}
                  placeholder="e.g. ||Chapter 1 - Prathama Adhyayam|| or Varalakshmi Pooja Vidhanam"
                  className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-[#FFB300]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-300 uppercase mb-1">URL Identifier (Slug)</label>
                <input 
                  type="text"
                  value={subFormSlug}
                  onChange={(e) => setSubFormSlug(e.target.value)}
                  placeholder="e.g. satyanarayana-chapter-1"
                  className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-[#FFB300]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-300 uppercase mb-1">Sacred Notes / Description</label>
                <textarea 
                  rows={3}
                  value={subFormDescription}
                  onChange={(e) => setSubFormDescription(e.target.value)}
                  placeholder="Optional sacred ritual summary, katha details, or notes..."
                  className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-[#FFB300]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2C2C2C]">
              <button 
                onClick={() => setIsSubModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs text-gray-400 hover:text-gray-200 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveSubcategory}
                className="bg-[#D84315] hover:bg-[#BF360C] text-white px-5 py-2 rounded-lg text-xs font-semibold transition shadow-md shadow-orange-950"
              >
                Save to MySQL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog for Language Create / Edit */}
      {isLangModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1C1C1C] border border-[#FFB300]/40 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[#FFB300] flex items-center gap-2">
              <Globe className="w-5 h-5 text-orange-400" />
              <span>{editingLangId ? 'Edit Language' : 'Create New Language'}</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-300 uppercase mb-1">Language Name</label>
                <input 
                  type="text"
                  value={langName}
                  onChange={(e) => setLangName(e.target.value)}
                  placeholder="e.g. Malayalam"
                  className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-[#FFB300]"
                />
              </div>

              {!editingLangId && (
                <div>
                  <label className="block font-semibold text-gray-300 uppercase mb-1">ISO Code (e.g. ml)</label>
                  <input 
                    type="text"
                    value={langCode}
                    onChange={(e) => setLangCode(e.target.value)}
                    placeholder="e.g. ml"
                    maxLength={10}
                    className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-[#FFB300] font-mono"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2C2C2C]">
              <button 
                onClick={() => setIsLangModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs text-gray-400 hover:text-gray-200 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveLanguage}
                className="bg-[#D84315] hover:bg-[#BF360C] text-white px-5 py-2 rounded-lg text-xs font-semibold transition"
              >
                Save Language
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog for Devotional Content Create */}
      {isContentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1C1C1C] border border-[#FFB300]/40 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[#FFB300] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-orange-400" />
              <span>Add Sacred Verse / Devotional Detail</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-300 uppercase mb-1">Category Association</label>
                <select 
                  value={contentCategoryId}
                  onChange={(e) => setContentCategoryId(e.target.value)}
                  className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-[#FFB300]"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.title} (#{c.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-300 uppercase mb-1">Verse / Stotra Title</label>
                <input 
                  type="text"
                  value={contentTitle}
                  onChange={(e) => setContentTitle(e.target.value)}
                  placeholder="e.g. హరివరాసనం ప్రథమ శ్లోకం"
                  className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-[#FFB300]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-300 uppercase mb-1">Sacred Verse Text</label>
                <textarea 
                  rows={3}
                  value={contentSacredText}
                  onChange={(e) => setContentSacredText(e.target.value)}
                  placeholder="Original sacred sloka lines..."
                  className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-[#FFB300] font-serif"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-300 uppercase mb-1">Spiritual Meaning / Explanation</label>
                <textarea 
                  rows={2}
                  value={contentMeaning}
                  onChange={(e) => setContentMeaning(e.target.value)}
                  placeholder="Devotional meaning..."
                  className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-[#FFB300]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2C2C2C]">
              <button 
                onClick={() => setIsContentModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs text-gray-400 hover:text-gray-200 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveContent}
                className="bg-[#D84315] hover:bg-[#BF360C] text-white px-5 py-2 rounded-lg text-xs font-semibold transition"
              >
                Save Sacred Verse to MySQL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog for Festival Create */}
      {isFestivalModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1C1C1C] border border-[#FFB300]/40 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[#FFB300] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-400" />
              <span>Create Sabarimala Festival / Observance</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-300 uppercase mb-1">Festival Name</label>
                <input 
                  type="text"
                  value={festivalName}
                  onChange={(e) => setFestivalName(e.target.value)}
                  placeholder="e.g. మండల పూజ (Mandala Pooja)"
                  className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-[#FFB300]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-300 uppercase mb-1">Annual Date</label>
                <input 
                  type="date"
                  value={festivalDate}
                  onChange={(e) => setFestivalDate(e.target.value)}
                  className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-[#FFB300]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-300 uppercase mb-1">Source & Observance Note</label>
                <textarea 
                  rows={2}
                  value={festivalNote}
                  onChange={(e) => setFestivalNote(e.target.value)}
                  placeholder="Sabarimala Devaswom verified calendar..."
                  className="w-full bg-[#121212] border border-[#2C2C2C] rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-[#FFB300]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2C2C2C]">
              <button 
                onClick={() => setIsFestivalModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs text-gray-400 hover:text-gray-200 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveFestival}
                className="bg-[#D84315] hover:bg-[#BF360C] text-white px-5 py-2 rounded-lg text-xs font-semibold transition"
              >
                Save Festival to MySQL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
