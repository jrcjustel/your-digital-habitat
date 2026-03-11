import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface UserPermissions {
  roles: string[];
  puede_leer: boolean;
  puede_escribir: boolean;
  puede_exportar: boolean;
  puede_generar_pdf: boolean;
  puede_administrar_usuarios: boolean;
  puede_importar_excel: boolean;
  puede_ver_financiero: boolean;
  puede_ver_legal: boolean;
}

const DEFAULT_PERMISSIONS: UserPermissions = {
  roles: [],
  puede_leer: false,
  puede_escribir: false,
  puede_exportar: false,
  puede_generar_pdf: false,
  puede_administrar_usuarios: false,
  puede_importar_excel: false,
  puede_ver_financiero: false,
  puede_ver_legal: false,
};

export const usePermissions = () => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<UserPermissions>(DEFAULT_PERMISSIONS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPermissions(DEFAULT_PERMISSIONS);
      setLoading(false);
      return;
    }

    const fetchPermissions = async () => {
      const { data, error } = await supabase.rpc("get_user_permissions", {
        _user_id: user.id,
      });

      if (!error && data) {
        setPermissions(data as unknown as UserPermissions);
      }
      setLoading(false);
    };

    fetchPermissions();
  }, [user]);

  const hasPermission = (permission: keyof Omit<UserPermissions, "roles">): boolean => {
    return permissions[permission] === true;
  };

  const hasRole = (role: string): boolean => {
    return permissions.roles?.includes(role) ?? false;
  };

  const isTeamMember = (): boolean => {
    const teamRoles = ["admin", "comercial", "analista", "legal", "finanzas", "marketing"];
    return permissions.roles?.some((r) => teamRoles.includes(r)) ?? false;
  };

  return {
    permissions,
    loading,
    hasPermission,
    hasRole,
    isTeamMember,
  };
};
