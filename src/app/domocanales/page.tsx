'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { useSettings } from '@/lib/contexts/SettingsContext'
import { fetchAllTabsData } from '@/lib/sheetsData'
import { formatCurrency, formatNumber } from '@/lib/utils'
import type { DomoCanalesMetric, TabData } from '@/lib/types'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from '@/components/ui/button'

type SortField = keyof DomoCanalesMetric
type SortDirection = 'asc' | 'desc'

// Lista de posibles nombres de hoja para probar
const POSSIBLE_SHEET_NAMES = [
    'DomoCanales',
    'DomoCanles',
    'Domo Canales',
    'Domo',
    'Canales'
];

export default function DomoCanalesPage() {
    const { settings } = useSettings()
    const [sortField, setSortField] = useState<SortField>('sessions')
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
    const [showRawData, setShowRawData] = useState(false)
    const [debugInfo, setDebugInfo] = useState<{
        fetchUrl: string;
        responseStatus: string;
        responseError: string;
        responseData: any;
        sheetTests: Record<string, any>;
        apiVersion: string;
    }>({ 
        fetchUrl: '',
        responseStatus: '',
        responseError: '',
        responseData: null,
        sheetTests: {},
        apiVersion: 'Usando lógica mejorada con prueba de nombres alternativos'
    })

    // Cargar los datos directamente para depuración
    useEffect(() => {
        const fetchDebugData = async () => {
            try {
                // Probar con el nombre de hoja normal
                const url = `${settings.sheetUrl}?tab=DomoCanales`;
                setDebugInfo(prev => ({ ...prev, fetchUrl: url }));
                
                const response = await fetch(url);
                setDebugInfo(prev => ({ 
                    ...prev, 
                    responseStatus: `${response.status} ${response.statusText}` 
                }));
                
                if (!response.ok) {
                    throw new Error(`Error: ${response.status} ${response.statusText}`);
                }
                
                const data = await response.json();
                setDebugInfo(prev => ({ ...prev, responseData: data }));
                
                // Probar con diferentes nombres de hoja para diagnóstico
                const sheetTests: Record<string, any> = {};
                
                for (const sheetName of POSSIBLE_SHEET_NAMES) {
                    try {
                        const testUrl = `${settings.sheetUrl}?tab=${sheetName}`;
                        const testResponse = await fetch(testUrl);
                        const testData = await testResponse.json();
                        
                        sheetTests[sheetName] = {
                            status: `${testResponse.status} ${testResponse.statusText}`,
                            isArray: Array.isArray(testData),
                            length: Array.isArray(testData) ? testData.length : 0,
                            data: testData
                        };
                    } catch (e) {
                        sheetTests[sheetName] = {
                            error: e instanceof Error ? e.message : String(e)
                        };
                    }
                }
                
                setDebugInfo(prev => ({ ...prev, sheetTests }));
                
            } catch (err) {
                console.error("Error fetching debug data:", err);
                setDebugInfo(prev => ({ 
                    ...prev, 
                    responseError: err instanceof Error ? err.message : String(err) 
                }));
            }
        };
        
        if (showRawData) {
            fetchDebugData();
        }
    }, [settings.sheetUrl, showRawData]);

    // Intentar cargar los datos usando SWR y el método fetchAllTabsData
    const { data: tabsData, error, isLoading } = useSWR<TabData>(
        settings.sheetUrl,
        fetchAllTabsData
    )

    if (error) {
        return (
            <div className="p-8 text-center">
                <div className="text-red-500 mb-4">Error cargando datos: {error.toString()}</div>
                <Button onClick={() => setShowRawData(!showRawData)} variant="outline">
                    {showRawData ? 'Ocultar detalles' : 'Ver detalles del error'}
                </Button>
                {showRawData && (
                    <div className="mt-4 p-4 bg-gray-100 rounded text-left">
                        <pre className="text-xs overflow-auto">{JSON.stringify(error, null, 2)}</pre>
                    </div>
                )}
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="p-8 text-center">
                <div className="mb-4">Cargando...</div>
                <Button onClick={() => setShowRawData(!showRawData)} variant="outline">
                    {showRawData ? 'Ocultar detalles' : 'Ver detalles de carga'}
                </Button>
                {showRawData && (
                    <div className="mt-4 p-4 bg-gray-100 rounded text-left">
                        <pre className="text-xs overflow-auto">
                            {`URL de la hoja: ${settings.sheetUrl}\n`}
                            {`Nombres de hojas a probar: ${POSSIBLE_SHEET_NAMES.join(', ')}\n`}
                            {`Versión de la API: ${debugInfo.apiVersion}`}
                        </pre>
                    </div>
                )}
            </div>
        )
    }

    // Intentar cargar datos tanto de DomoCanales como de DomoCanles por si acaso
    let domoCanalesData: DomoCanalesMetric[] = [];
    
    // Intentar con 'DomoCanales'
    if (tabsData?.DomoCanales && tabsData.DomoCanales.length > 0) {
        console.log(`DomoCanales: Encontrados ${tabsData.DomoCanales.length} registros en tabsData.DomoCanales`);
        domoCanalesData = tabsData.DomoCanales.map(item => {
            // Asegurar que tenemos el formato correcto
            if ('date' in item && 'platform' in item && 'channel' in item) {
                return item;
            }
            
            // Si no, intentar mapear campos
            const rawItem = item as any;
            return {
                date: String(rawItem.date || rawItem.nombre || ''),
                platform: String(rawItem.platform || rawItem.categoria || ''),
                channel: String(rawItem.channel || ''),
                sessions: Number(rawItem.sessions || rawItem.visitas || 0),
                transactions: Number(rawItem.transactions || rawItem.ventas || 0),
                transactionRevenue: Number(rawItem.transactionRevenue || rawItem.ingreso || 0)
            } as DomoCanalesMetric;
        });
    } else if (showRawData && debugInfo.responseData && Array.isArray(debugInfo.responseData)) {
        // Probar directamente con los datos crudos de la respuesta de depuración
        console.warn('No se encontraron datos en tabsData.DomoCanales. Intentando con datos crudos de depuración.');
        domoCanalesData = debugInfo.responseData.map((row: any) => ({
            date: String(row.date || ''),
            platform: String(row.platform || ''),
            channel: String(row.channel || ''),
            sessions: Number(row.sessions || 0),
            transactions: Number(row.transactions || 0),
            transactionRevenue: Number(row.transactionRevenue || 0)
        }));
    } else if (showRawData) {
        // Probar con los resultados de nuestras pruebas de diferentes nombres de hoja
        console.warn('No se encontraron datos en tabsData.DomoCanales ni en responseData. Intentando con pruebas de nombres de hoja.');
        for (const [sheetName, result] of Object.entries(debugInfo.sheetTests)) {
            if (result.isArray && result.length > 0) {
                domoCanalesData = result.data.map((row: any) => ({
                    date: String(row.date || ''),
                    platform: String(row.platform || ''),
                    channel: String(row.channel || ''),
                    sessions: Number(row.sessions || 0),
                    transactions: Number(row.transactions || 0),
                    transactionRevenue: Number(row.transactionRevenue || 0)
                }));
                if (domoCanalesData.length > 0) {
                    console.log(`Found data using sheet name: ${sheetName}`);
                    break;
                }
            }
        }
    }

    // Ordenar datos
    const sortedData = [...domoCanalesData].sort((a, b) => {
        const aVal = a[sortField]
        const bVal = b[sortField]
        const multiplier = sortDirection === 'asc' ? 1 : -1

        // Manejar clasificación especial para campos de texto vs números
        if (typeof aVal === 'string' && typeof bVal === 'string') {
            return aVal.localeCompare(bVal) * multiplier
        }
        return (Number(aVal) - Number(bVal)) * multiplier
    })

    const handleSort = (field: SortField) => {
        if (field === sortField) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortDirection('desc')
        }
    }

    const SortButton = ({ field, children }: { field: SortField, children: React.ReactNode }) => (
        <Button
            variant="ghost"
            onClick={() => handleSort(field)}
            className="h-8 px-2 lg:px-3"
        >
            {children}
            {sortField === field && (
                <span className="ml-2">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                </span>
            )}
        </Button>
    )

    return (
        <div className="container mx-auto px-4 py-12 mt-16">
            <h1 className="text-3xl font-bold mb-12 text-gray-900">Domo Canales</h1>
            
            <div className="mb-6 flex gap-4">
                <Button 
                    onClick={() => setShowRawData(!showRawData)}
                    variant="outline"
                >
                    {showRawData ? 'Ocultar datos crudos' : 'Mostrar datos crudos'}
                </Button>
                
                <div className="text-sm bg-green-100 p-2 rounded flex items-center">
                    <span className="font-semibold">Estado:</span>
                    <span className="ml-2">
                        {domoCanalesData.length > 0 
                            ? `✅ ${domoCanalesData.length} registros cargados` 
                            : '❌ No hay datos disponibles'}
                    </span>
                </div>
            </div>
            
            {showRawData && (
                <div className="mb-8 p-4 bg-gray-100 rounded overflow-auto max-h-[500px]">
                    <h2 className="text-lg font-semibold mb-2">Información de depuración:</h2>
                    
                    <h3 className="text-md font-semibold mt-4">URL utilizada:</h3>
                    <pre className="text-xs bg-gray-200 p-2 rounded">{debugInfo.fetchUrl}</pre>
                    
                    <h3 className="text-md font-semibold mt-4">Estado de la respuesta:</h3>
                    <pre className="text-xs bg-gray-200 p-2 rounded">{debugInfo.responseStatus || 'No disponible'}</pre>
                    
                    {debugInfo.responseError && (
                        <>
                            <h3 className="text-md font-semibold mt-4 text-red-500">Error:</h3>
                            <pre className="text-xs bg-red-100 p-2 rounded">{debugInfo.responseError}</pre>
                        </>
                    )}
                    
                    <h3 className="text-md font-semibold mt-4">Datos sin procesar recibidos:</h3>
                    <pre className="text-xs bg-gray-200 p-2 rounded">
                        {debugInfo.responseData ? JSON.stringify(debugInfo.responseData, null, 2) : 'No hay datos'}
                    </pre>
                    
                    <h3 className="text-md font-semibold mt-4">Resultados de pruebas con diferentes nombres de hojas:</h3>
                    <div className="text-xs bg-gray-200 p-2 rounded">
                        {Object.entries(debugInfo.sheetTests).map(([sheetName, result]) => (
                            <div key={sheetName} className="mb-2">
                                <strong>{sheetName}:</strong> 
                                {result.error ? (
                                    <span className="text-red-500"> Error: {result.error}</span>
                                ) : (
                                    <span> {result.status}, Es array: {String(result.isArray)}, Longitud: {result.length}</span>
                                )}
                                {result.isArray && result.length > 0 && (
                                    <details>
                                        <summary>Ver datos</summary>
                                        <pre className="ml-4 mt-1 text-xs">{JSON.stringify(result.data.slice(0, 3), null, 2)}</pre>
                                        {result.data.length > 3 && <div className="ml-4 mt-1">... y {result.data.length - 3} más</div>}
                                    </details>
                                )}
                            </div>
                        ))}
                    </div>
                    
                    <h3 className="text-md font-semibold mt-4">Datos procesados por fetchAllTabsData:</h3>
                    <pre className="text-xs bg-gray-200 p-2 rounded">
                        {tabsData ? JSON.stringify({
                            DomoCanales: tabsData.DomoCanales?.length || 0,
                            daily: tabsData.daily?.length || 0,
                            searchTerms: tabsData.searchTerms?.length || 0
                        }, null, 2) : 'No hay datos'}
                    </pre>
                    
                    <h3 className="text-md font-semibold mt-4">Datos después del mapeo manual:</h3>
                    <pre className="text-xs bg-gray-200 p-2 rounded">
                        {domoCanalesData.length > 0 ? JSON.stringify(domoCanalesData.slice(0, 3), null, 2) + (domoCanalesData.length > 3 ? "\n... y " + (domoCanalesData.length - 3) + " más" : "") : 'No hay datos'}
                    </pre>
                </div>
            )}

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[120px]">
                                <SortButton field="date">Fecha</SortButton>
                            </TableHead>
                            <TableHead className="w-[120px]">
                                <SortButton field="platform">Plataforma</SortButton>
                            </TableHead>
                            <TableHead className="w-[150px]">
                                <SortButton field="channel">Canal</SortButton>
                            </TableHead>
                            <TableHead className="text-right">
                                <SortButton field="sessions">Sesiones</SortButton>
                            </TableHead>
                            <TableHead className="text-right">
                                <SortButton field="transactions">Transacciones</SortButton>
                            </TableHead>
                            <TableHead className="text-right">
                                <SortButton field="transactionRevenue">Ingresos</SortButton>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedData.length > 0 ? (
                            sortedData.slice(0, 15).map((item, i) => (
                                <TableRow key={`${item.date}-${item.platform}-${item.channel}-${i}`}>
                                    <TableCell className="font-medium">{item.date}</TableCell>
                                    <TableCell>{item.platform}</TableCell>
                                    <TableCell>{item.channel}</TableCell>
                                    <TableCell className="text-right">{formatNumber(item.sessions)}</TableCell>
                                    <TableCell className="text-right">{formatNumber(item.transactions)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(item.transactionRevenue, settings.currency)}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-6">
                                    <div className="mb-4">No hay datos disponibles.</div>
                                    <div className="text-sm text-gray-600 mb-2">
                                        Posibles causas:
                                        <ul className="list-disc list-inside">
                                            <li>La hoja "DomoCanales" o "DomoCanles" no existe en el documento</li>
                                            <li>La hoja existe pero está vacía o no tiene el formato esperado</li>
                                            <li>Hay un problema de conexión con Google Sheets</li>
                                        </ul>
                                    </div>
                                    {!showRawData && (
                                        <Button 
                                            onClick={() => setShowRawData(true)} 
                                            variant="outline"
                                            className="mt-2"
                                        >
                                            Mostrar herramientas de diagnóstico
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
} 