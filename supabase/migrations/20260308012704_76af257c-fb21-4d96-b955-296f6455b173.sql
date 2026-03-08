
-- =============================================
-- FASE 1A: ÍNDICES DE RENDIMIENTO
-- =============================================

-- npl_assets: tabla principal con +27K registros, necesita índices para las queries más frecuentes
CREATE INDEX idx_npl_assets_publicado ON public.npl_assets (publicado);
CREATE INDEX idx_npl_assets_provincia ON public.npl_assets (provincia);
CREATE INDEX idx_npl_assets_tipo_activo ON public.npl_assets (tipo_activo);
CREATE INDEX idx_npl_assets_precio ON public.npl_assets (precio_orientativo);
CREATE INDEX idx_npl_assets_comunidad ON public.npl_assets (comunidad_autonoma);
CREATE INDEX idx_npl_assets_municipio ON public.npl_assets (municipio);
CREATE INDEX idx_npl_assets_created_at ON public.npl_assets (created_at);
-- Índice compuesto para la query más común: listado filtrado de activos publicados
CREATE INDEX idx_npl_assets_publicado_provincia ON public.npl_assets (publicado, provincia, tipo_activo);
CREATE INDEX idx_npl_assets_publicado_precio ON public.npl_assets (publicado, precio_orientativo);

-- chat_messages: búsquedas frecuentes por conversation_id
CREATE INDEX idx_chat_messages_conversation ON public.chat_messages (conversation_id, created_at);

-- chat_conversations: búsquedas por user_id ordenadas por updated_at
CREATE INDEX idx_chat_conversations_user ON public.chat_conversations (user_id, updated_at DESC);

-- alerts: búsquedas por user_id
CREATE INDEX idx_alerts_user ON public.alerts (user_id, is_active);

-- favorites: búsquedas por user_id
CREATE INDEX idx_favorites_user ON public.favorites (user_id);

-- documents: búsquedas por property_id y npl_asset_id
CREATE INDEX idx_documents_property ON public.documents (property_id);
CREATE INDEX idx_documents_npl_asset ON public.documents (npl_asset_id);
CREATE INDEX idx_documents_uploaded_by ON public.documents (uploaded_by);

-- offers: búsquedas por property_id y email
CREATE INDEX idx_offers_property ON public.offers (property_id);
CREATE INDEX idx_offers_email ON public.offers (email);

-- channel_subscribers: búsquedas por channel activo
CREATE INDEX idx_channel_subscribers_channel ON public.channel_subscribers (channel, is_active);

-- valuation_leads: búsquedas por fecha
CREATE INDEX idx_valuation_leads_created ON public.valuation_leads (created_at DESC);
