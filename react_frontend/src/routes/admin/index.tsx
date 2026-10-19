import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { FloatingOrbs } from "@/components/background/FloatingOrbs";
import {
  Database,
  Table as TableIcon,
  Server,
  FileCode,
  ExternalLink,
  RefreshCw,
  Search,
  Terminal,
  Layers,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface TableInfo {
  name: string;
  count: number;
}

interface DatabaseOverview {
  status: string;
  database_type: string;
  file_path: string;
  file_size_kb: number;
  swagger_url: string;
  tables: TableInfo[];
}

interface TableDataResponse {
  table: string;
  columns: string[];
  total_records: number;
  page: number;
  limit: number;
  records: Record<string, any>[];
}

import { useAuth } from "@/components/providers/AuthProvider";
import { useNavigate } from "react-router-dom";

export const DatabaseExplorerPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const isAdmin = isAuthenticated && user && String(user.role).toLowerCase() === "admin";

  const [overview, setOverview] = useState<DatabaseOverview | null>(null);
  const [activeTable, setActiveTable] = useState<string>("courses");
  const [tableData, setTableData] = useState<TableDataResponse | null>(null);
  const [isLoadingOverview, setIsLoadingOverview] = useState(true);
  const [isLoadingTable, setIsLoadingTable] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchOverview = async () => {
    if (!isAdmin) return;
    setIsLoadingOverview(true);
    try {
      const res = await api.get("/admin/database/overview");
      setOverview(res.data);
      if (res.data.tables?.length > 0 && !activeTable) {
        setActiveTable(res.data.tables[0].name);
      }
    } catch (e: any) {
      if (e?.response?.status === 403) {
        toast.error("Admin privileges required to access database");
      } else {
        toast.error("Could not load database overview");
      }
    } finally {
      setIsLoadingOverview(false);
    }
  };

  const fetchTableData = async (table: string, page = 1) => {
    if (!isAdmin) return;
    setIsLoadingTable(true);
    try {
      const res = await api.get(`/admin/database/table/${table}?page=${page}&limit=25`);
      setTableData(res.data);
      setCurrentPage(page);
    } catch (e) {
      toast.error(`Could not load records for table '${table}'`);
    } finally {
      setIsLoadingTable(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [isAdmin]);

  useEffect(() => {
    if (activeTable && isAdmin) {
      fetchTableData(activeTable, 1);
    }
  }, [activeTable, isAdmin]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard!`);
  };

  const filteredRecords = tableData?.records.filter((row) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return Object.values(row).some((val) =>
      String(val).toLowerCase().includes(term)
    );
  }) || [];

  if (!isAdmin) {
    return (
      <div className="relative min-h-[85vh] flex items-center justify-center px-4">
        <FloatingOrbs />
        <div className="card-base max-w-md w-full p-8 text-center space-y-4 border-destructive/40 shadow-glow">
          <div className="w-14 h-14 rounded-full bg-destructive/15 border border-destructive/30 text-destructive flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-display text-foreground">
              Admin Clearance Required
            </h2>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Direct access to raw database tables, SQL schemas, and backend administration endpoints is restricted to verified Administrator accounts only.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-background/50 border border-border/60 text-[11px] font-mono text-muted-foreground">
            Current session: <span className="text-primary font-bold">{user?.email || "Guest"}</span> ({user?.role || "user"})
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="btn-primary w-full text-xs h-9 cursor-pointer"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[92vh] max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <FloatingOrbs />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/25 text-primary">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display text-foreground">
                Database & Backend Inspector
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Direct live access to your local database tables, schema schemas, and API documentation.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href="https://course-builder-18y2.onrender.com/docs"
            target="_blank"
            rel="noreferrer"
            className="btn-outline h-9 px-3.5 text-xs flex items-center gap-1.5"
          >
            <Server className="w-3.5 h-3.5 text-primary" />
            FastAPI Swagger Docs
            <ExternalLink className="w-3 h-3 text-muted-foreground" />
          </a>
          <button
            onClick={() => {
              fetchOverview();
              if (activeTable) fetchTableData(activeTable, currentPage);
            }}
            className="btn-ghost h-9 px-3 text-xs"
            title="Refresh database records"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-base p-4.5 space-y-2">
          <span className="text-[11px] font-mono text-muted-foreground uppercase font-semibold">
            Database Engine
          </span>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-foreground">
              {overview?.database_type || "SQLite 3.x / SQLAlchemy"}
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground font-mono block">
            Status: Healthy & Connected
          </span>
        </div>

        <div className="card-base p-4.5 space-y-2">
          <span className="text-[11px] font-mono text-muted-foreground uppercase font-semibold">
            File Location & Size
          </span>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-foreground font-medium truncate max-w-[180px]">
              courseforge.db
            </span>
            <span className="text-xs font-mono text-primary font-bold">
              {overview?.file_size_kb || 0} KB
            </span>
          </div>
          <button
            onClick={() =>
              copyToClipboard(
                overview?.file_path || "fastapi_backend/courseforge.db",
                "file path"
              )
            }
            className="text-[10px] text-primary hover:underline flex items-center gap-1 font-mono"
          >
            <Copy className="w-2.5 h-2.5" /> Copy Absolute Path
          </button>
        </div>

        <div className="card-base p-4.5 space-y-2">
          <span className="text-[11px] font-mono text-muted-foreground uppercase font-semibold">
            CLI Direct Access
          </span>
          <div className="p-1.5 rounded bg-background/80 border border-border/60 text-[11px] font-mono text-primary flex items-center justify-between">
            <span className="truncate">sqlite3 courseforge.db</span>
            <button
              onClick={() =>
                copyToClipboard(
                  `sqlite3 ${overview?.file_path || "fastapi_backend/courseforge.db"}`,
                  "CLI command"
                )
              }
              className="text-muted-foreground hover:text-primary ml-1"
            >
              <Copy className="w-3 h-3" />
            </button>
          </div>
          <span className="text-[10px] text-muted-foreground block">
            Run in terminal for raw SQLite prompt
          </span>
        </div>

        <div className="card-base p-4.5 space-y-2">
          <span className="text-[11px] font-mono text-muted-foreground uppercase font-semibold">
            Total Entities
          </span>
          <div className="text-xl font-bold font-mono text-primary">
            {overview?.tables.reduce((acc, t) => acc + t.count, 0) || 0}
            <span className="text-xs font-sans font-normal text-muted-foreground ml-2">
              across {overview?.tables.length || 0} tables
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground block">
            Live SQLAlchemy async session
          </span>
        </div>
      </div>

      {/* Main Table Explorer Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Table List Sidebar */}
        <div className="lg:col-span-3 card-base p-3 space-y-1">
          <div className="px-3 py-2 border-b border-border/40 flex items-center justify-between text-xs font-bold text-foreground">
            <span>Tables</span>
            <span className="text-[10px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              {overview?.tables.length || 0}
            </span>
          </div>

          <div className="space-y-1 pt-1">
            {overview?.tables.map((tbl) => {
              const isActive = activeTable === tbl.name;
              return (
                <button
                  key={tbl.name}
                  onClick={() => setActiveTable(tbl.name)}
                  className={`w-full p-2.5 rounded-lg flex items-center justify-between text-xs transition-all cursor-pointer ${isActive
                    ? "bg-primary/15 text-primary font-bold border-l-2 border-primary"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                    }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <TableIcon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{tbl.name}</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-background/60 text-muted-foreground">
                    {tbl.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Table Data Viewer */}
        <div className="lg:col-span-9 card-base p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-border/40">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-primary font-bold uppercase">
                Table:
              </span>
              <h2 className="text-lg font-bold font-display text-foreground">
                {activeTable}
              </h2>
              <span className="text-xs text-muted-foreground font-mono">
                ({tableData?.total_records || 0} total records)
              </span>
            </div>

            {/* Filter Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Filter table rows..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field text-xs pl-8 h-8 py-1"
              />
            </div>
          </div>

          {/* Records Table View */}
          {isLoadingTable ? (
            <div className="py-20 text-center text-xs text-muted-foreground">
              Loading records from {activeTable}...
            </div>
          ) : !tableData || filteredRecords.length === 0 ? (
            <div className="py-16 text-center text-xs text-muted-foreground space-y-1">
              <p>No records found in table '{activeTable}' {searchTerm ? `matching '${searchTerm}'` : ""}.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border/60">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border/60 text-[11px] font-mono text-muted-foreground uppercase">
                    {tableData.columns.map((col) => (
                      <th key={col} className="p-3 font-semibold whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 bg-background/30 font-mono text-[11px]">
                  {filteredRecords.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-secondary/30 transition-colors">
                      {tableData.columns.map((col) => {
                        const val = row[col];
                        const isJson = typeof val === "object" && val !== null;
                        const displayStr = isJson
                          ? JSON.stringify(val)
                          : String(val === null || val === undefined ? "NULL" : val);

                        return (
                          <td
                            key={col}
                            className={`p-3 max-w-[240px] truncate ${val === null
                              ? "text-muted-foreground/50 italic"
                              : col === "id" || col.endsWith("_id")
                                ? "text-primary"
                                : "text-foreground"
                              }`}
                            title={displayStr}
                          >
                            {displayStr}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {tableData && tableData.total_records > tableData.limit && (
            <div className="flex items-center justify-between pt-3 text-xs text-muted-foreground">
              <span>
                Page {tableData.page} of {Math.ceil(tableData.total_records / tableData.limit)}
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => fetchTableData(activeTable, currentPage - 1)}
                  className="btn-outline h-7 px-2.5 text-xs disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  disabled={
                    currentPage >= Math.ceil(tableData.total_records / tableData.limit)
                  }
                  onClick={() => fetchTableData(activeTable, currentPage + 1)}
                  className="btn-outline h-7 px-2.5 text-xs disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default DatabaseExplorerPage;
