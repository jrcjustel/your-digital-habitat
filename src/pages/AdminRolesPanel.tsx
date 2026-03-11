import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import {
  Shield, Users, History, Search, Plus, Trash2, Loader2,
  CheckCircle, XCircle, Settings, UserPlus, ArrowLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// ─── Types ───

interface RoleIkesa {
  id: string;
  nombre_rol: string;
  descripcion: string | null;
  puede_leer: boolean;
  puede_escribir: boolean;
  puede_exportar: boolean;
  puede_generar_pdf: boolean;
  puede_administrar_usuarios: boolean;
  puede_importar_excel: boolean;
  puede_ver_financiero: boolean;
  puede_ver_legal: boolean;
  created_at: string;
  updated_at: string;
}

interface UserWithRoles {
  user_id: string;
  display_name: string | null;
  roles: string[];
}

interface HistorialRow {
  id: string;
  entidad_tipo: string;
  entidad_id: string;
  campo_modificado: string;
  valor_anterior: string | null;
  valor_nuevo: string | null;
  usuario_nombre: string | null;
  usuario_id: string | null;
  created_at: string;
}

const PERMISSION_LABELS: Record<string, string> = {
  puede_leer: "Leer datos",
  puede_escribir: "Escribir / Editar",
  puede_exportar: "Exportar datos",
  puede_generar_pdf: "Generar PDF",
  puede_administrar_usuarios: "Admin usuarios",
  puede_importar_excel: "Importar Excel",
  puede_ver_financiero: "Ver financiero",
  puede_ver_legal: "Ver legal",
};

const ALL_ROLES = ["admin", "moderator", "user", "comercial", "analista", "legal", "finanzas", "marketing"];

// ─── Component ───

const AdminRolesPanel = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<RoleIkesa[]>([]);
  const [usersWithRoles, setUsersWithRoles] = useState<UserWithRoles[]>([]);
  const [historial, setHistorial] = useState<HistorialRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState("");
  const [historialSearch, setHistorialSearch] = useState("");

  // Role edit dialog
  const [editingRole, setEditingRole] = useState<RoleIkesa | null>(null);
  const [editPerms, setEditPerms] = useState<Record<string, boolean>>({});

  // Assign role dialog
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignUserId, setAssignUserId] = useState("");
  const [assignRole, setAssignRole] = useState("");
  const [allProfiles, setAllProfiles] = useState<{ user_id: string; display_name: string | null }[]>([]);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([loadRoles(), loadUsersWithRoles(), loadHistorial(), loadProfiles()]);
    setLoading(false);
  };

  const loadRoles = async () => {
    const { data } = await supabase.from("roles_ikesa").select("*").order("nombre_rol");
    if (data) setRoles(data as unknown as RoleIkesa[]);
  };

  const loadUsersWithRoles = async () => {
    const { data: rolesData } = await supabase.from("user_roles").select("user_id, role");
    const { data: profilesData } = await supabase.from("profiles").select("user_id, display_name");

    if (rolesData && profilesData) {
      const userMap: Record<string, { display_name: string | null; roles: string[] }> = {};
      for (const r of rolesData) {
        if (!userMap[r.user_id]) {
          const profile = profilesData.find((p: any) => p.user_id === r.user_id);
          userMap[r.user_id] = { display_name: profile?.display_name || null, roles: [] };
        }
        userMap[r.user_id].roles.push(r.role);
      }
      setUsersWithRoles(
        Object.entries(userMap).map(([user_id, data]) => ({ user_id, ...data }))
          .sort((a, b) => (a.display_name || "").localeCompare(b.display_name || ""))
      );
    }
  };

  const loadHistorial = async () => {
    const { data } = await supabase
      .from("historial_cambios")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (data) setHistorial(data as unknown as HistorialRow[]);
  };

  const loadProfiles = async () => {
    const { data } = await supabase.from("profiles").select("user_id, display_name").order("display_name");
    if (data) setAllProfiles(data as any[]);
  };

  // ─── Role Permissions Edit ───

  const openRoleEdit = (role: RoleIkesa) => {
    setEditingRole(role);
    setEditPerms({
      puede_leer: role.puede_leer,
      puede_escribir: role.puede_escribir,
      puede_exportar: role.puede_exportar,
      puede_generar_pdf: role.puede_generar_pdf,
      puede_administrar_usuarios: role.puede_administrar_usuarios,
      puede_importar_excel: role.puede_importar_excel,
      puede_ver_financiero: role.puede_ver_financiero,
      puede_ver_legal: role.puede_ver_legal,
    });
  };

  const saveRolePerms = async () => {
    if (!editingRole) return;
    const { error } = await supabase
      .from("roles_ikesa")
      .update(editPerms)
      .eq("id", editingRole.id);

    if (error) {
      toast.error("Error al guardar permisos: " + error.message);
    } else {
      toast.success(`Permisos de "${editingRole.nombre_rol}" actualizados`);
      setEditingRole(null);
      loadRoles();
    }
  };

  // ─── Assign / Remove Role ───

  const assignRoleToUser = async () => {
    if (!assignUserId || !assignRole) {
      toast.error("Selecciona usuario y rol");
      return;
    }

    const { error } = await supabase.from("user_roles").insert({
      user_id: assignUserId,
      role: assignRole as any,
    });

    if (error) {
      if (error.code === "23505") {
        toast.error("El usuario ya tiene ese rol asignado");
      } else {
        toast.error("Error: " + error.message);
      }
    } else {
      toast.success("Rol asignado correctamente");
      setAssignOpen(false);
      setAssignUserId("");
      setAssignRole("");
      loadUsersWithRoles();
    }
  };

  const removeRole = async (userId: string, role: string) => {
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .eq("role", role as any);

    if (error) {
      toast.error("Error al quitar rol: " + error.message);
    } else {
      toast.success("Rol eliminado");
      loadUsersWithRoles();
    }
  };

  // ─── Filters ───

  const filteredUsers = usersWithRoles.filter(
    (u) =>
      !userSearch ||
      (u.display_name || "").toLowerCase().includes(userSearch.toLowerCase()) ||
      u.roles.some((r) => r.toLowerCase().includes(userSearch.toLowerCase()))
  );

  const filteredHistorial = historial.filter(
    (h) =>
      !historialSearch ||
      h.campo_modificado.toLowerCase().includes(historialSearch.toLowerCase()) ||
      (h.usuario_nombre || "").toLowerCase().includes(historialSearch.toLowerCase()) ||
      h.entidad_tipo.toLowerCase().includes(historialSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  const roleBadgeColor = (role: string) => {
    const map: Record<string, string> = {
      admin: "bg-destructive/15 text-destructive border-destructive/30",
      comercial: "bg-primary/15 text-primary border-primary/30",
      analista: "bg-accent/15 text-accent border-accent/30",
      finanzas: "bg-primary/15 text-primary border-primary/30",
      legal: "bg-accent/15 text-accent border-accent/30",
      marketing: "bg-primary/15 text-primary border-primary/30",
      moderator: "bg-muted text-muted-foreground border-border",
      user: "bg-secondary text-secondary-foreground border-border",
    };
    return map[role] || "bg-secondary text-secondary-foreground border-border";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/panel")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Shield className="w-8 h-8 text-accent" />
              Gestión de Roles y Permisos
            </h1>
            <p className="text-muted-foreground mt-1">Administra roles del equipo IKESA, permisos granulares e historial de cambios</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">{roles.length}</div>
              <div className="text-xs text-muted-foreground">Roles definidos</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-accent">{usersWithRoles.length}</div>
              <div className="text-xs text-muted-foreground">Usuarios con rol</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {usersWithRoles.filter((u) => u.roles.includes("admin")).length}
              </div>
              <div className="text-xs text-muted-foreground">Administradores</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">{historial.length}</div>
              <div className="text-xs text-muted-foreground">Cambios registrados</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="roles" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-lg">
            <TabsTrigger value="roles" className="gap-2 text-xs">
              <Settings className="w-4 h-4" /> Roles y Permisos
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2 text-xs">
              <Users className="w-4 h-4" /> Asignación
            </TabsTrigger>
            <TabsTrigger value="historial" className="gap-2 text-xs">
              <History className="w-4 h-4" /> Historial
            </TabsTrigger>
          </TabsList>

          {/* ═══ TAB: ROLES & PERMISOS ═══ */}
          <TabsContent value="roles">
            <div className="grid gap-4 md:grid-cols-2">
              {roles.map((role) => (
                <Card key={role.id} className="hover:border-accent/40 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Badge className={`${roleBadgeColor(role.nombre_rol)} text-xs`}>{role.nombre_rol}</Badge>
                      </CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => openRoleEdit(role)} className="gap-1.5 text-xs">
                        <Settings className="w-3.5 h-3.5" /> Editar
                      </Button>
                    </div>
                    {role.descripcion && (
                      <CardDescription className="text-xs">{role.descripcion}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(PERMISSION_LABELS).map(([key, label]) => {
                        const enabled = (role as any)[key];
                        return (
                          <Badge
                            key={key}
                            variant="outline"
                            className={`text-[10px] ${
                              enabled
                                ? "bg-accent/10 text-accent border-accent/30"
                                : "bg-muted/50 text-muted-foreground/50 border-border/50 line-through"
                            }`}
                          >
                            {enabled ? <CheckCircle className="w-2.5 h-2.5 mr-1" /> : <XCircle className="w-2.5 h-2.5 mr-1" />}
                            {label}
                          </Badge>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ═══ TAB: USER ASSIGNMENT ═══ */}
          <TabsContent value="users">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o rol..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Badge variant="secondary">{filteredUsers.length} usuarios</Badge>
              <Button onClick={() => setAssignOpen(true)} className="gap-2">
                <UserPlus className="w-4 h-4" /> Asignar rol
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Roles asignados</TableHead>
                      <TableHead className="w-20">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                          No hay usuarios con roles asignados
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((u) => (
                        <TableRow key={u.user_id}>
                          <TableCell className="font-medium text-foreground">
                            {u.display_name || "Sin nombre"}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {u.user_id.slice(0, 8)}…
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1.5">
                              {u.roles.map((role) => (
                                <Badge
                                  key={role}
                                  className={`${roleBadgeColor(role)} text-[10px] gap-1 cursor-pointer hover:opacity-70`}
                                  onClick={() => removeRole(u.user_id, role)}
                                  title="Clic para quitar rol"
                                >
                                  {role}
                                  <Trash2 className="w-2.5 h-2.5" />
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setAssignUserId(u.user_id);
                                setAssignOpen(true);
                              }}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ TAB: HISTORIAL ═══ */}
          <TabsContent value="historial">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por campo, usuario o entidad..."
                  value={historialSearch}
                  onChange={(e) => setHistorialSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Badge variant="secondary">{filteredHistorial.length} registros</Badge>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-36">Fecha</TableHead>
                      <TableHead>Entidad</TableHead>
                      <TableHead>Campo</TableHead>
                      <TableHead>Antes</TableHead>
                      <TableHead>Después</TableHead>
                      <TableHead>Usuario</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHistorial.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                          <History className="w-10 h-10 mx-auto mb-3 opacity-30" />
                          No hay cambios registrados
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredHistorial.map((h) => (
                        <TableRow key={h.id}>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(h.created_at).toLocaleDateString("es-ES", {
                              day: "numeric",
                              month: "short",
                              year: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px]">{h.entidad_tipo}</Badge>
                            <span className="block text-[10px] text-muted-foreground font-mono mt-0.5">
                              {h.entidad_id.slice(0, 8)}…
                            </span>
                          </TableCell>
                          <TableCell className="text-sm font-medium text-foreground">{h.campo_modificado}</TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate" title={h.valor_anterior || "—"}>
                            {h.valor_anterior || "—"}
                          </TableCell>
                          <TableCell className="text-xs text-foreground max-w-[120px] truncate" title={h.valor_nuevo || "—"}>
                            {h.valor_nuevo || "—"}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{h.usuario_nombre || "Sistema"}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* ═══ DIALOG: Edit Role Permissions ═══ */}
        <Dialog open={!!editingRole} onOpenChange={(open) => !open && setEditingRole(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-accent" />
                Permisos de <Badge className={roleBadgeColor(editingRole?.nombre_rol || "")}>{editingRole?.nombre_rol}</Badge>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-4">
              {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-secondary/50">
                  <span className="text-sm text-foreground">{label}</span>
                  <Switch
                    checked={editPerms[key] ?? false}
                    onCheckedChange={(checked) => setEditPerms((prev) => ({ ...prev, [key]: checked }))}
                  />
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingRole(null)}>Cancelar</Button>
              <Button onClick={saveRolePerms}>Guardar permisos</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ═══ DIALOG: Assign Role ═══ */}
        <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-accent" />
                Asignar rol a usuario
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Usuario</label>
                <Select value={assignUserId} onValueChange={setAssignUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar usuario" />
                  </SelectTrigger>
                  <SelectContent>
                    {allProfiles.map((p) => (
                      <SelectItem key={p.user_id} value={p.user_id}>
                        {p.display_name || p.user_id.slice(0, 8)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Rol</label>
                <Select value={assignRole} onValueChange={setAssignRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_ROLES.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAssignOpen(false)}>Cancelar</Button>
              <Button onClick={assignRoleToUser} disabled={!assignUserId || !assignRole}>Asignar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Footer />
    </div>
  );
};

export default AdminRolesPanel;
