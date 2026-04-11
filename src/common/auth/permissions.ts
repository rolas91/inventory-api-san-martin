/**
 * Catálogo de permisos del API.
 * Usa formato `recurso:accion` para mantener consistencia.
 */
export const PERMISSIONS = {
  // Autorización
  AUTHZ_MANAGE: 'authz:manage',

  // Usuarios
  USERS_CREATE: 'users:create',
  USERS_LIST: 'users:list',
  USERS_UPDATE_ROLE: 'users:update_role',
  USERS_UPDATE_STATUS: 'users:update_status',

  // Bodegas
  BODEGAS_CREATE: 'bodegas:create',
  BODEGAS_UPDATE: 'bodegas:update',
  BODEGAS_DELETE: 'bodegas:delete',

  // Ubicaciones
  UBICACIONES_CREATE: 'ubicaciones:create',
  UBICACIONES_UPDATE: 'ubicaciones:update',
  UBICACIONES_DELETE: 'ubicaciones:delete',

  // Inventario (períodos/conteos)
  INV_PERIODOS_CREATE: 'inv_periodos:create',
  INV_PERIODOS_UPDATE_ESTADO: 'inv_periodos:update_estado',
  INV_PERIODOS_CREATE_CONTEO: 'inv_periodos:create_conteo',
  INV_CONTEOS_UPDATE_ESTADO: 'inv_conteos:update_estado',
  INV_CONTEOS_BATCH_DETALLE: 'inv_conteos:batch_detalle',
  INV_CONTEOS_SYNC_COMPLETO: 'inv_conteos:sync_completo',

  // Recepciones
  RECEPCIONES_CREATE: 'recepciones:create',
  RECEPCIONES_UPDATE_ESTADO: 'recepciones:update_estado',
  RECEPCIONES_BATCH_DETALLE: 'recepciones:batch_detalle',
  RECEPCIONES_SYNC_COMPLETA: 'recepciones:sync_completa',

  // Planta
  PLANTA_CREATE_PRODUCT: 'planta:create_product',
  PLANTA_IMPORT_PRODUCTS: 'planta:import_products',
  PLANTA_IMPORT_PRODUCTS_KILOS: 'planta:import_products_kilos',
} as const;

export type AppPermission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
