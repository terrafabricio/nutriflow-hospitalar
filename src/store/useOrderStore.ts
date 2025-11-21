import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export type DietType = 'Livre' | 'Branda' | 'Pastosa' | 'Cremosa' | 'Líquida Completa' | 'Líquida Restrita';
export type DietModifier = 'Nenhuma' | 'Hipossódica' | 'Hipolipídica' | 'Diabetes (DM)' | 'Renal' | 'Neutropênica';
export type OrderStatus = 'Novos' | 'Em Preparo' | 'Pronto' | 'Entregue' | 'Concluido';

export interface Patient {
    id: string;
    name: string;
    bed: string;
    ward: string;
    allergies?: string;
    isFasting?: boolean;
    fastingReason?: string;
}

export interface Order {
    id: string;
    patientId: string;
    patientName: string;
    bed: string;
    dietType: DietType;
    modifier: DietModifier;
    status: OrderStatus;
    createdAt: Date;
    notes?: string;
    hasCompanion?: boolean;
    companionDiet?: 'Padrão' | 'Personalizada';
    isFasting?: boolean;
    fastingReason?: string;
    deliveredAt?: Date;
    meal?: 'Café da Manhã' | 'Almoço' | 'Lanche da Tarde' | 'Jantar' | 'Ceia';
    acceptance?: 'Aceitação Total' | 'Aceitação Parcial' | 'Recusa';
}

export interface Notice {
    id: string;
    content: string;
    isCompleted: boolean;
    createdAt: Date;
}

interface OrderState {
    patients: Patient[];
    orders: Order[];
    notices: Notice[];
    isLoading: boolean;
    fetchData: () => Promise<void>;
    subscribeToChanges: () => () => void;
    addPatient: (patient: Omit<Patient, 'id'>) => Promise<void>;
    removePatient: (id: string) => Promise<void>;
    addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => Promise<void>;
    moveOrder: (id: string, status: OrderStatus) => Promise<void>;
    completeOrder: (id: string, acceptance?: 'Aceitação Total' | 'Aceitação Parcial' | 'Recusa') => Promise<void>;
    checkDuplicateOrder: (patientId: string, meal: string) => boolean;

    // Notices Actions
    addNotice: (content: string) => Promise<void>;
    toggleNotice: (id: string, isCompleted: boolean) => Promise<void>;
    deleteNotice: (id: string) => Promise<void>;

    // Computed Metrics
    getDashboardMetrics: () => {
        totalPatients: number;
        specialDiets: number;
        totalOrders: number;
        pendingOrders: number;
    };
}

export const useOrderStore = create<OrderState>((set, get) => ({
    patients: [],
    orders: [],
    notices: [],
    isLoading: false,

    fetchData: async () => {
        set({ isLoading: true });
        try {
            const { data: patients, error: patientsError } = await supabase.from('patients').select('*');
            if (patientsError) throw patientsError;

            // Buscar últimos 100 pedidos sem filtro de data (evita problemas de timezone)
            const { data: orders, error: ordersError } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100);

            if (ordersError) throw ordersError;

            console.log('📦 Pedidos carregados do banco:', orders?.length || 0, 'pedidos');
            console.log('🔍 Primeiros 3 pedidos:', orders?.slice(0, 3));

            const { data: notices, error: noticesError } = await supabase.from('notices').select('*').order('created_at', { ascending: false });

            // Map patients (sector -> ward)
            const formattedPatients = patients?.map(p => ({
                ...p,
                ward: p.sector
            })) || [];

            // Convert string dates to Date objects for orders
            const formattedOrders = orders?.map(order => ({
                ...order,
                id: order.id,
                patientId: order.patient_id,
                createdAt: new Date(order.created_at),
                deliveredAt: order.delivered_at ? new Date(order.delivered_at) : undefined,
                patientName: order.patient_name,
                dietType: order.diet, // Coluna 'diet' no Supabase
                hasCompanion: order.has_companion,
                companionDiet: order.companion_diet,
                isFasting: order.is_fasting,
                fastingReason: order.fasting_reason
            })) || [];

            console.log('✅ Pedidos formatados:', formattedOrders.length);

            // Map notices
            const formattedNotices = notices?.map(n => ({
                id: n.id,
                content: n.content,
                isCompleted: n.is_completed,
                createdAt: new Date(n.created_at)
            })) || [];

            set({
                patients: formattedPatients as any,
                orders: formattedOrders as any,
                notices: formattedNotices
            });
        } catch (error) {
            console.error('❌ Error fetching data:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    subscribeToChanges: () => {
        console.log('🔔 Iniciando subscription realtime...');

        const channel = supabase
            .channel('realtime-dashboard')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
                console.log('🔄 Evento realtime em ORDERS:', payload.eventType, payload.new);
                get().fetchData();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'patients' }, (payload) => {
                console.log('🔄 Evento realtime em PATIENTS:', payload.eventType);
                get().fetchData();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'notices' }, (payload) => {
                console.log('🔄 Evento realtime em NOTICES:', payload.eventType);
                get().fetchData();
            })
            .subscribe((status) => {
                console.log('📡 Status da subscription:', status);
            });

        return () => {
            console.log('🔕 Removendo subscription realtime...');
            supabase.removeChannel(channel);
        };
    },

    addPatient: async (patient) => {
        try {
            const dbPatient = {
                ...patient,
                sector: patient.ward
            };
            delete (dbPatient as any).ward;

            const { error } = await supabase.from('patients').insert([dbPatient]);
            if (error) throw error;
            await get().fetchData();
        } catch (error: any) {
            console.error("Error adding patient:", JSON.stringify(error, null, 2));
            if (error.message) console.error("Error message:", error.message);
        }
    },

    removePatient: async (id) => {
        try {
            const { error } = await supabase.from('patients').delete().match({ id });
            if (error) throw error;
            await get().fetchData();
        } catch (error) {
            console.error('Error removing patient:', error);
        }
    },

    addOrder: async (order) => {
        try {
            if (!order.patientId) throw new Error("ID do Paciente inválido (patientId is missing)");

            const dbOrder = {
                patient_id: order.patientId,
                patient_name: order.patientName,
                bed: order.bed,
                diet: order.dietType, // Coluna 'diet' no Supabase
                modifier: order.modifier || '',
                status: 'Novos',
                created_at: new Date().toISOString(),
                notes: order.notes,
                has_companion: order.hasCompanion,
                companion_diet: order.companionDiet,
                is_fasting: order.isFasting,
                fasting_reason: order.fastingReason,
                meal: order.meal || 'Jantar'
            };

            const { error } = await supabase.from('orders').insert([dbOrder]);
            if (error) throw error;
            await get().fetchData();
        } catch (error: any) {
            console.error("Error adding order FULL:", JSON.stringify(error, null, 2));
            if (error) console.error("Error Details:", error.message, error.details, error.hint);
        }
    },

    moveOrder: async (id, status) => {
        try {
            const updateData: any = { status };
            if (status === 'Entregue') {
                updateData.delivered_at = new Date().toISOString();
            }
            const { error } = await supabase.from('orders').update(updateData).match({ id });
            if (error) throw error;
            await get().fetchData();
        } catch (error) {
            console.error('Error moving order:', error);
        }
    },

    completeOrder: async (id, acceptance) => {
        try {
            const { error } = await supabase.from('orders').update({
                status: 'Concluido',
                acceptance,
                delivered_at: new Date().toISOString()
            }).match({ id });
            if (error) throw error;
            await get().fetchData();
        } catch (error) {
            console.error('Error completing order:', error);
        }
    },

    checkDuplicateOrder: (patientId, meal) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const state = get();
        return state.orders.some(order => {
            const orderDate = new Date(order.createdAt);
            orderDate.setHours(0, 0, 0, 0);

            return (
                order.patientId === patientId &&
                order.meal === meal &&
                orderDate.getTime() === today.getTime()
            );
        });
    },

    // Notices Implementation
    addNotice: async (content) => {
        try {
            const { error } = await supabase.from('notices').insert([{
                content,
                is_completed: false,
                created_at: new Date().toISOString()
            }]);
            if (error) throw error;
            await get().fetchData();
        } catch (error) {
            console.error('Error adding notice:', error);
        }
    },

    toggleNotice: async (id, isCompleted) => {
        try {
            const { error } = await supabase.from('notices').update({ is_completed: isCompleted }).match({ id });
            if (error) throw error;
            await get().fetchData();
        } catch (error) {
            console.error('Error toggling notice:', error);
        }
    },

    deleteNotice: async (id) => {
        try {
            const { error } = await supabase.from('notices').delete().match({ id });
            if (error) throw error;
            await get().fetchData();
        } catch (error) {
            console.error('Error deleting notice:', error);
        }
    },

    getDashboardMetrics: () => {
        const state = get();
        return {
            totalPatients: state.patients.length,
            specialDiets: state.orders.filter(o => o.dietType !== 'Livre').length,
            totalOrders: state.orders.length,
            pendingOrders: state.orders.filter(o => o.status !== 'Concluido' && o.status !== 'Entregue').length
        };
    }
}));
