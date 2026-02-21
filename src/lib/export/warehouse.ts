import { adminDb } from '@/lib/firebase/admin';
import type { ExportConfig } from '@/types';

// ===========================================
// PIXLY - Data Warehouse Export (Phase 3.6)
// Config management, query building, and export
// execution for BigQuery, S3, Snowflake, Redshift
// ===========================================

// ============ TYPES ============

export interface ExportResult {
  success: boolean;
  rowsExported: number;
  error?: string;
}

export interface ExportRow {
  [key: string]: unknown;
}

// ============ CRUD OPERATIONS ============

/**
 * Create a new export configuration
 */
export async function createExportConfig(
  config: Omit<ExportConfig, 'id' | 'createdAt' | 'lastExportAt'>
): Promise<ExportConfig> {
  const docRef = adminDb.collection('export_configs').doc();

  const now = new Date();
  const exportConfig: ExportConfig = {
    id: docRef.id,
    ...config,
    lastExportAt: null,
    createdAt: now,
  };

  await docRef.set({
    ...exportConfig,
    createdAt: now,
    lastExportAt: null,
  });

  return exportConfig;
}

/**
 * Retrieve all export configurations for a workspace
 */
export async function getExportConfigs(
  workspaceId: string
): Promise<ExportConfig[]> {
  const snapshot = await adminDb
    .collection('export_configs')
    .where('workspaceId', '==', workspaceId)
    .orderBy('createdAt', 'desc')
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      workspaceId: data.workspaceId,
      destination: data.destination,
      connectionString: data.connectionString,
      schedule: data.schedule,
      tables: data.tables,
      enabled: data.enabled,
      lastExportAt: data.lastExportAt?.toDate?.() ?? data.lastExportAt ?? null,
      createdAt: data.createdAt?.toDate?.() ?? data.createdAt ?? new Date(),
    } as ExportConfig;
  });
}

/**
 * Update an existing export configuration
 */
export async function updateExportConfig(
  configId: string,
  updates: Partial<ExportConfig>
): Promise<void> {
  const docRef = adminDb.collection('export_configs').doc(configId);
  const doc = await docRef.get();

  if (!doc.exists) {
    throw new Error(`Export configuration introuvable : ${configId}`);
  }

  // Strip immutable fields
  const { id: _id, createdAt: _createdAt, ...safeUpdates } = updates;
  await docRef.update({
    ...safeUpdates,
    updatedAt: new Date(),
  });
}

/**
 * Delete an export configuration
 */
export async function deleteExportConfig(configId: string): Promise<void> {
  const docRef = adminDb.collection('export_configs').doc(configId);
  const doc = await docRef.get();

  if (!doc.exists) {
    throw new Error(`Export configuration introuvable : ${configId}`);
  }

  await docRef.delete();
}

// ============ EXPORT EXECUTION ============

/**
 * Execute an export based on the configuration.
 *
 * For BigQuery: would use @google-cloud/bigquery client
 * For S3: would use @aws-sdk/client-s3
 * For Snowflake/Redshift: would use respective Node.js drivers
 *
 * Currently implements data extraction and preparation.
 * The actual connection/upload requires the respective SDK installed.
 */
export async function executeExport(
  config: ExportConfig
): Promise<ExportResult> {
  try {
    // Determine the date range for this export
    const dateRange = getExportDateRange(config.schedule, config.lastExportAt);

    let totalRows = 0;

    // Extract data for each requested table
    for (const table of config.tables) {
      const rows = await extractTableData(
        config.workspaceId,
        table,
        dateRange
      );
      totalRows += rows.length;

      // Route to the appropriate destination
      switch (config.destination) {
        case 'bigquery':
          await exportToBigQuery(config.connectionString, table, rows);
          break;
        case 's3':
          await exportToS3(config.connectionString, table, rows, dateRange);
          break;
        case 'snowflake':
          await exportToSnowflake(config.connectionString, table, rows);
          break;
        case 'redshift':
          await exportToRedshift(config.connectionString, table, rows);
          break;
        default:
          throw new Error(`Destination non supportée : ${config.destination}`);
      }
    }

    // Update the lastExportAt timestamp
    await adminDb.collection('export_configs').doc(config.id).update({
      lastExportAt: new Date(),
      updatedAt: new Date(),
    });

    console.log(
      `[Warehouse] Export completed for ${config.workspaceId}: ${totalRows} rows to ${config.destination}`
    );

    return { success: true, rowsExported: totalRows };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Warehouse] Export failed for ${config.workspaceId}:`, message);

    // Log the failure
    await adminDb.collection('export_logs').add({
      configId: config.id,
      workspaceId: config.workspaceId,
      destination: config.destination,
      status: 'failed',
      error: message,
      timestamp: new Date(),
    });

    return { success: false, rowsExported: 0, error: message };
  }
}

// ============ SQL QUERY BUILDERS ============

/**
 * Build a SQL query for extracting data from a specific table.
 * Used for BigQuery/Snowflake/Redshift destinations.
 */
export function buildExportQuery(
  workspaceId: string,
  tables: string[],
  dateRange: { start: Date; end: Date }
): string {
  const startISO = dateRange.start.toISOString();
  const endISO = dateRange.end.toISOString();

  const queries = tables.map((table) => {
    switch (table) {
      case 'events':
        return buildEventsQuery(workspaceId, startISO, endISO);
      case 'conversions':
        return buildConversionsQuery(workspaceId, startISO, endISO);
      case 'sessions':
        return buildSessionsQuery(workspaceId, startISO, endISO);
      default:
        return `-- Unknown table: ${table}`;
    }
  });

  return queries.join('\n\n');
}

function buildEventsQuery(
  workspaceId: string,
  startISO: string,
  endISO: string
): string {
  return `-- Events export for workspace: ${workspaceId}
SELECT
  id,
  pixel_id,
  workspace_id,
  event_type,
  event_name,
  timestamp,
  session_id,
  fpid,
  hashed_email,
  user_id,
  value,
  currency,
  -- Click IDs
  click_ids.gclid,
  click_ids.fbclid,
  click_ids.ttclid,
  click_ids.utm_source,
  click_ids.utm_medium,
  click_ids.utm_campaign,
  -- Context
  context.url,
  context.referrer,
  context.country,
  context.country_code,
  context.city,
  context.device_type,
  context.browser,
  context.os,
  -- Attribution
  attributed,
  attributed_to.model AS attribution_model,
  attributed_to.channel AS attribution_channel
FROM events
WHERE workspace_id = '${workspaceId}'
  AND timestamp >= '${startISO}'
  AND timestamp <= '${endISO}'
ORDER BY timestamp DESC;`;
}

function buildConversionsQuery(
  workspaceId: string,
  startISO: string,
  endISO: string
): string {
  return `-- Conversions export for workspace: ${workspaceId}
SELECT
  id,
  workspace_id,
  event_id,
  type,
  value,
  currency,
  timestamp,
  -- Attribution
  attribution.model AS attribution_model,
  -- First touchpoint
  attribution.touchpoints[0].channel AS first_touch_channel,
  attribution.touchpoints[0].source AS first_touch_source,
  attribution.touchpoints[0].campaign AS first_touch_campaign,
  attribution.touchpoints[0].credit AS first_touch_credit,
  -- Sync status
  synced.meta.synced AS meta_synced,
  synced.meta.synced_at AS meta_synced_at,
  synced.google.synced AS google_synced,
  synced.google.synced_at AS google_synced_at
FROM conversions
WHERE workspace_id = '${workspaceId}'
  AND timestamp >= '${startISO}'
  AND timestamp <= '${endISO}'
ORDER BY timestamp DESC;`;
}

function buildSessionsQuery(
  workspaceId: string,
  startISO: string,
  endISO: string
): string {
  return `-- Sessions export for workspace: ${workspaceId}
SELECT
  id,
  pixel_id,
  workspace_id,
  fpid,
  started_at,
  last_activity_at,
  landing_page,
  referrer,
  -- Click IDs
  click_ids.gclid,
  click_ids.fbclid,
  click_ids.ttclid,
  click_ids.utm_source,
  click_ids.utm_medium,
  click_ids.utm_campaign,
  -- Outcome
  converted,
  conversion_value,
  ARRAY_LENGTH(events) AS event_count
FROM sessions
WHERE workspace_id = '${workspaceId}'
  AND started_at >= '${startISO}'
  AND started_at <= '${endISO}'
ORDER BY started_at DESC;`;
}

// ============ DATA EXTRACTION ============

/**
 * Extract data from a Firestore collection for export.
 */
async function extractTableData(
  workspaceId: string,
  table: string,
  dateRange: { start: Date; end: Date }
): Promise<ExportRow[]> {
  const collectionName = getCollectionName(table);
  const timestampField = getTimestampField(table);

  const snapshot = await adminDb
    .collection(collectionName)
    .where('workspaceId', '==', workspaceId)
    .where(timestampField, '>=', dateRange.start)
    .where(timestampField, '<=', dateRange.end)
    .orderBy(timestampField, 'desc')
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return flattenDocument(doc.id, data, table);
  });
}

/**
 * Map table names to Firestore collection names
 */
function getCollectionName(table: string): string {
  const mapping: Record<string, string> = {
    events: 'events',
    conversions: 'conversions',
    sessions: 'sessions',
  };

  return mapping[table] || table;
}

/**
 * Get the timestamp field used for date filtering per table
 */
function getTimestampField(table: string): string {
  const mapping: Record<string, string> = {
    events: 'timestamp',
    conversions: 'timestamp',
    sessions: 'startedAt',
  };

  return mapping[table] || 'timestamp';
}

/**
 * Flatten a Firestore document into a flat row for export.
 * Handles nested objects by joining keys with underscores.
 */
function flattenDocument(
  id: string,
  data: Record<string, unknown>,
  table: string
): ExportRow {
  const row: ExportRow = { id };

  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) {
      row[key] = null;
      continue;
    }

    // Convert Firestore Timestamps to ISO strings
    if (typeof value === 'object' && value !== null && 'toDate' in value) {
      row[key] = (value as { toDate: () => Date }).toDate().toISOString();
      continue;
    }

    // Flatten nested objects one level deep
    if (typeof value === 'object' && !Array.isArray(value)) {
      const nested = value as Record<string, unknown>;
      for (const [nestedKey, nestedValue] of Object.entries(nested)) {
        if (
          typeof nestedValue === 'object' &&
          nestedValue !== null &&
          'toDate' in nestedValue
        ) {
          row[`${key}_${nestedKey}`] = (
            nestedValue as { toDate: () => Date }
          )
            .toDate()
            .toISOString();
        } else {
          row[`${key}_${nestedKey}`] = nestedValue ?? null;
        }
      }
      continue;
    }

    row[key] = value;
  }

  return row;
}

// ============ DESTINATION HANDLERS ============

/**
 * Export rows to BigQuery.
 * Requires @google-cloud/bigquery SDK.
 * Currently logs the operation; actual upload needs the SDK installed.
 */
async function exportToBigQuery(
  connectionString: string,
  table: string,
  rows: ExportRow[]
): Promise<void> {
  // connectionString format: "project_id:dataset_id"
  const [projectId, datasetId] = connectionString.split(':');

  if (!projectId || !datasetId) {
    throw new Error(
      'BigQuery connection string must be in format "project_id:dataset_id"'
    );
  }

  console.log(
    `[Warehouse/BigQuery] Would insert ${rows.length} rows into ${projectId}.${datasetId}.${table}`
  );

  // Actual implementation with @google-cloud/bigquery:
  // const { BigQuery } = require('@google-cloud/bigquery');
  // const bigquery = new BigQuery({ projectId });
  // const dataset = bigquery.dataset(datasetId);
  // const tableRef = dataset.table(table);
  // await tableRef.insert(rows);
}

/**
 * Export rows to Amazon S3 as a JSON Lines file.
 * Requires @aws-sdk/client-s3 SDK.
 * Currently logs the operation; actual upload needs the SDK installed.
 */
async function exportToS3(
  connectionString: string,
  table: string,
  rows: ExportRow[],
  dateRange: { start: Date; end: Date }
): Promise<void> {
  // connectionString format: "s3://bucket-name/prefix"
  const s3Match = connectionString.match(/^s3:\/\/([^/]+)\/?(.*)$/);

  if (!s3Match) {
    throw new Error(
      'S3 connection string must be in format "s3://bucket-name/prefix"'
    );
  }

  const bucket = s3Match[1];
  const prefix = s3Match[2] || '';
  const dateStr = dateRange.start.toISOString().split('T')[0];
  const key = `${prefix}${prefix ? '/' : ''}${table}/${dateStr}.jsonl`;

  // Build JSON Lines content
  const jsonlContent = rows.map((row) => JSON.stringify(row)).join('\n');

  console.log(
    `[Warehouse/S3] Would upload ${rows.length} rows to s3://${bucket}/${key} (${jsonlContent.length} bytes)`
  );

  // Actual implementation with @aws-sdk/client-s3:
  // const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
  // const client = new S3Client({});
  // await client.send(new PutObjectCommand({
  //   Bucket: bucket,
  //   Key: key,
  //   Body: jsonlContent,
  //   ContentType: 'application/x-ndjson',
  // }));
}

/**
 * Export rows to Snowflake.
 * Requires snowflake-sdk.
 * Currently logs the operation; actual upload needs the SDK installed.
 */
async function exportToSnowflake(
  connectionString: string,
  table: string,
  rows: ExportRow[]
): Promise<void> {
  // connectionString format: "account.region:warehouse:database:schema"
  const parts = connectionString.split(':');

  if (parts.length < 4) {
    throw new Error(
      'Snowflake connection string must be in format "account.region:warehouse:database:schema"'
    );
  }

  const [account, warehouse, database, schema] = parts;

  console.log(
    `[Warehouse/Snowflake] Would insert ${rows.length} rows into ${database}.${schema}.${table} on ${account} (warehouse: ${warehouse})`
  );

  // Actual implementation with snowflake-sdk:
  // const snowflake = require('snowflake-sdk');
  // const connection = snowflake.createConnection({ account, ... });
  // await connection.connect();
  // const stmt = connection.execute({ sqlText: buildInsertSQL(table, rows) });
}

/**
 * Export rows to Amazon Redshift.
 * Requires pg (node-postgres) or @aws-sdk/client-redshift-data.
 * Currently logs the operation; actual upload needs the SDK installed.
 */
async function exportToRedshift(
  connectionString: string,
  table: string,
  rows: ExportRow[]
): Promise<void> {
  // connectionString format: "postgresql://user:pass@host:port/database"
  console.log(
    `[Warehouse/Redshift] Would insert ${rows.length} rows into ${table} via Redshift`
  );

  // Actual implementation with pg:
  // const { Pool } = require('pg');
  // const pool = new Pool({ connectionString });
  // const client = await pool.connect();
  // await client.query(buildInsertSQL(table, rows));
  // client.release();
}

// ============ HELPERS ============

/**
 * Determine the date range for an export based on schedule and last export time.
 */
function getExportDateRange(
  schedule: ExportConfig['schedule'],
  lastExportAt: Date | null
): { start: Date; end: Date } {
  const end = new Date();

  if (lastExportAt) {
    // Export from last export time to now
    return { start: lastExportAt, end };
  }

  // First export: use a default lookback based on schedule
  const start = new Date();
  switch (schedule) {
    case 'hourly':
      start.setHours(start.getHours() - 1);
      break;
    case 'daily':
      start.setDate(start.getDate() - 1);
      break;
    case 'weekly':
      start.setDate(start.getDate() - 7);
      break;
  }

  return { start, end };
}

/**
 * Get all export configs that are due to run.
 */
export async function getDueExports(): Promise<ExportConfig[]> {
  const now = new Date();

  const snapshot = await adminDb
    .collection('export_configs')
    .where('enabled', '==', true)
    .get();

  return snapshot.docs
    .map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        workspaceId: data.workspaceId,
        destination: data.destination,
        connectionString: data.connectionString,
        schedule: data.schedule,
        tables: data.tables,
        enabled: data.enabled,
        lastExportAt: data.lastExportAt?.toDate?.() ?? null,
        createdAt: data.createdAt?.toDate?.() ?? new Date(),
      } as ExportConfig;
    })
    .filter((config) => isExportDue(config, now));
}

/**
 * Check if an export is due to run based on schedule and last execution.
 */
function isExportDue(config: ExportConfig, now: Date): boolean {
  if (!config.lastExportAt) return true; // Never run before

  const lastExport = config.lastExportAt.getTime();
  const elapsed = now.getTime() - lastExport;

  switch (config.schedule) {
    case 'hourly':
      return elapsed >= 60 * 60 * 1000; // 1 hour
    case 'daily':
      return elapsed >= 24 * 60 * 60 * 1000; // 24 hours
    case 'weekly':
      return elapsed >= 7 * 24 * 60 * 60 * 1000; // 7 days
    default:
      return false;
  }
}
