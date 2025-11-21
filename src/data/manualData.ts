import { ManualSection } from '../types/manual';

export const manualData: ManualSection[] = [
    {
        id: 'intro',
        title: 'Informações Gerais',
        category: 'Geral',
        content: [
            { type: 'header', value: 'Manual de Dietas Hospitalares HC-UFU/EBSERH' },
            { type: 'paragraph', value: 'HOSPITAL DE CLÍNICAS DE UBERLÂNDIA - Avenida Pará, nº 1720 - Bairro Umuarama' },
            { type: 'header', value: 'Composição das Refeições' },
            {
                type: 'list', value: [
                    '1) Prato base: Arroz e feijão',
                    '2) Prato principal: Carne bovina, suína, peixes ou aves (100g)',
                    '3) Guarnição: Legumes refogados/cozidos, farofas, purês (100g)',
                    '4) Salada: Folhas (50g) e legumes crus (80g)',
                    '5) Sobremesa: Frutas (100g) ou doces',
                    '6) Suco: 250ml (integral ou polpa)'
                ]
            },
            { type: 'header', value: 'Horários de Distribuição' },
            {
                type: 'table', value: {
                    title: 'Quadro 3: Horário de distribuição',
                    headers: ['Refeição', 'Horário'],
                    rows: [
                        { 'Refeição': 'Café da manhã', 'Horário': '07:30 às 08:30 horas' },
                        { 'Refeição': 'Almoço', 'Horário': '11:30 às 12:30 horas' },
                        { 'Refeição': 'Lanche da tarde', 'Horário': '14:30 às 15:30 horas' },
                        { 'Refeição': 'Jantar', 'Horário': '17:30 às 18:30 horas' },
                        { 'Refeição': 'Ceia', 'Horário': '20:00 às 21:00 horas' }
                    ]
                }
            }
        ]
    },
    {
        id: 'liquida-restrita',
        title: 'Líquida Restrita',
        category: 'Consistência',
        content: [
            { type: 'paragraph', value: 'Dieta altamente restritiva, contém apenas alimentos líquidos, coados ou que se liquefazem a temperatura corporal. Indicada para repouso gastrointestinal, preparo de exames e pós-operatório.' },
            { type: 'alert', value: 'Alimentos Permitidos: Água, Água de coco integral, suco coado, gelatina, chá, consommé de legumes, isotônicos.' },
            {
                type: 'table', value: {
                    title: 'Quadro 4: DESCRIÇÃO DAS REFEIÇÕES',
                    headers: ['Refeição', 'Preparação', 'Quantidade'],
                    rows: [
                        { 'Refeição': 'Desjejum/Colação', 'Preparação': 'Chá, Gelatina, Água de coco, Suco coado', 'Quantidade': '200 ml cada' },
                        { 'Refeição': 'Almoço/Jantar', 'Preparação': 'Consommé de Legumes, Gelatina', 'Quantidade': '200 ml cada' },
                        { 'Refeição': 'Lanche/Ceia', 'Preparação': 'Chá, Gelatina, Água de coco, Suco coado', 'Quantidade': '200 ml cada' }
                    ]
                }
            }
        ]
    },
    {
        id: 'liquida-completa',
        title: 'Líquida Completa',
        category: 'Consistência',
        content: [
            { type: 'paragraph', value: 'Dieta líquida, homogênea, sem grumos. Contém alimentos líquidos ou que liquefazem. Indicada para disfagia, pós-op TGI, cirurgias de cabeça e pescoço.' },
            {
                type: 'table', value: {
                    title: 'Quadro 5: DESCRIÇÃO DAS REFEIÇÕES',
                    headers: ['Refeição', 'Preparação', 'Qtd'],
                    rows: [
                        { 'Refeição': 'Desjejum', 'Preparação': 'Mingau ralo, Gelatina, Café, Suco', 'Qtd': '200ml / 100ml' },
                        { 'Refeição': 'Almoço/Jantar', 'Preparação': 'Sopa batida (500ml), Gelatina (200ml)', 'Qtd': '500ml / 200ml' },
                        { 'Refeição': 'Lanche', 'Preparação': 'Vitamina, Café, Suco, Água de coco', 'Qtd': 'Variado' }
                    ]
                }
            }
        ]
    },
    {
        id: 'pastosa',
        title: 'Pastosa',
        category: 'Consistência',
        content: [
            { type: 'paragraph', value: 'Alimentos moídos, desfiados, amassados, bem macios e em cortes pequenos ou liquidificados (purês). Indicada para dificuldade de mastigação, disfagia leve, idosos.' },
            { type: 'alert', value: 'PROIBIDO: Verduras cruas duras, alimentos secos, grãos inteiros, embutidos, carnes duras.' },
            {
                type: 'table', value: {
                    title: 'Quadro 10: DESCRIÇÃO DAS REFEIÇÕES',
                    headers: ['Refeição', 'Componentes', 'Qtd'],
                    rows: [
                        { 'Refeição': 'Desjejum', 'Componentes': 'Mingau, Café, Pão de batata, Fruta macia', 'Qtd': 'Variado' },
                        { 'Refeição': 'Almoço/Jantar', 'Componentes': 'Arroz papa (100g), Feijão batido (60g), Carne moída/desfiada (100g), Purê (80g), Fruta macia (100g)', 'Qtd': 'Prato completo' }
                    ]
                }
            }
        ]
    },
    {
        id: 'hipossodica',
        title: 'Hipossódica',
        category: 'Terapêutica',
        content: [
            { type: 'paragraph', value: 'Dieta com baixo teor de sódio (2g/dia). Arroz e guarnição sem sal, apenas feijão e carne com sal. Pão sem sal nos lanches.' },
            { type: 'alert', value: 'Indicada para Hipertensão, Edemas, Doenças Renais, Cardiopatias.' },
            {
                type: 'table', value: {
                    title: 'Quadro 13: DESCRIÇÃO DAS REFEIÇÕES',
                    headers: ['Refeição', 'Detalhes'],
                    rows: [
                        { 'Refeição': 'Desjejum', 'Detalhes': 'Pão francês sem sal (50g), Mingau, Fruta' },
                        { 'Refeição': 'Almoço/Jantar', 'Detalhes': 'Arroz (100g), Feijão (60g), Carne (100g), Guarnição (80g), Salada, Fruta, Molho de ervas' },
                        { 'Refeição': 'Restrição', 'Detalhes': 'Alimentos embutidos, enlatados e conservas proibidos.' }
                    ]
                }
            }
        ]
    },
    {
        id: 'diabetes-adulto',
        title: 'Diabetes (Adulto)',
        category: 'Terapêutica',
        content: [
            { type: 'paragraph', value: 'Restrição de açúcar/sacarose, rica em fibras (25g/dia). Carboidratos controlados. Disponível em 1400, 1600, 1800, 2000, 2200 e 2400 Kcal.' },
            { type: 'alert', value: 'Kit Hipoglicemia: Disponível para correções (15g de açúcar).' },
            {
                type: 'table', value: {
                    title: 'Quadro 46: Exemplo DM 1800 kcal',
                    headers: ['Refeição', 'Alimentos', 'Qtd'],
                    rows: [
                        { 'Refeição': 'Desjejum', 'Alimentos': 'Mingau aveia diet, Pão integral (50g), Fruta', 'Qtd': 'Variado' },
                        { 'Refeição': 'Almoço', 'Alimentos': 'Arroz integral (100g), Feijão (70g), Carne (80g), Guarnição (60g), Salada (80g)', 'Qtd': 'Prato' },
                        { 'Refeição': 'Lanche', 'Alimentos': 'Leite, Pão integral (25g), Manteiga', 'Qtd': 'Variado' }
                    ]
                }
            }
        ]
    },
    {
        id: 'renal-conservador',
        title: 'Renal Crônico (Conservador)',
        category: 'Terapêutica',
        content: [
            { type: 'paragraph', value: 'Hipoproteica (0,6 a 0,8g/kg), hipossódica, hipocalêmica e hipofosfatêmica. Controle rigoroso de potássio (técnica de remolho).' },
            { type: 'alert', value: 'Proibido: Carambola, embutidos, leguminosas sem remolho, oleaginosas.' },
            {
                type: 'table', value: {
                    title: 'Quadro 51: DESCRIÇÃO',
                    headers: ['Refeição', 'Componentes'],
                    rows: [
                        { 'Refeição': 'Geral', 'Componentes': 'Feijão com teor reduzido de potássio (40g), Frutas pobres em potássio (maçã, pera, etc), Arroz (100g).' }
                    ]
                }
            }
        ]
    },
    {
        id: 'hemodialise',
        title: 'Hemodiálise',
        category: 'Ambulatório',
        content: [
            { type: 'paragraph', value: 'Lanches ricos em proteína para pacientes em sessão de diálise. Kit padronizado por turno.' },
            {
                type: 'list', value: [
                    'Grupo Laticínios: Leite + Lácteo',
                    'Grupo Cereais: Pão com manteiga + Sanduíche (carne/frango/ovo)',
                    'Grupo Frutas: 1 porção (100g)',
                    'Grupo Líquidos: Chá, Café ou Suco'
                ]
            }
        ]
    },
    {
        id: 'pediatria-introducao',
        title: 'Pediatria (6-11 meses)',
        category: 'Pediatria',
        content: [
            { type: 'paragraph', value: 'Introdução alimentar complementar ao leite materno. Consistência pastosa (amassada), sem sal (ou mínimo), sem açúcar.' },
            {
                type: 'table', value: {
                    title: 'Quadro 34: Esquema',
                    headers: ['Idade', 'Refeições'],
                    rows: [
                        { 'Idade': '6 meses', 'Refeições': 'Papa de fruta (manhã/tarde) + 1 Papa principal (Almoço)' },
                        { 'Idade': '7-8 meses', 'Refeições': 'Papa de fruta + 2 Papas principais (Almoço/Jantar)' }
                    ]
                }
            }
        ]
    },
    {
        id: 'receitas',
        title: 'Receitas Especiais',
        category: 'Extras',
        content: [
            { type: 'paragraph', value: 'Receitas padronizadas para alergias e eventos.' },
            {
                type: 'list', value: [
                    'Bolo de cenoura com ovo (Cupcakes)',
                    'Bolo de cenoura com leite',
                    'Docinho de Leite em pó',
                    'Gelacreme',
                    'Fórmula sem lactose'
                ]
            }
        ]
    }
];
