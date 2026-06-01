/**
 * Семантический индекс: маппинг человекопонятных запросов → поля таблиц
 * 
 * Каждый «концепт» содержит:
 * - keywords: слова/фразы которые пользователь может ввести
 * - matches: массив {docId, fieldName} — конкретные поля в таблицах
 */
export const semanticConcepts = [
  // --- Клиент / Покупатель ---
  {
    concept: 'клиент',
    keywords: ['клиент', 'покупатель', 'заказчик', 'customer', 'контрагент', 'пользователь'],
    matches: [
      { docId: '3', fields: ['customer_code', 'customer_name', 'inn', 'email', 'phone'] },
      { docId: '10', fields: ['id'] }, // customer_360_profile
    ],
  },
  // --- Регион / География ---
  {
    concept: 'регион',
    keywords: ['регион', 'город', 'география', 'region', 'территория', 'локация', 'адрес', 'местоположение'],
    matches: [
      { docId: '1', fields: ['region_code'] },
      { docId: '3', fields: ['region_id', 'region_name', 'city', 'address'] },
      { docId: '8', fields: ['id'] }, // delivery_sla_metrics — по регионам
    ],
  },
  // --- Тариф / Сегмент / Лояльность ---
  {
    concept: 'тариф',
    keywords: ['тариф', 'сегмент', 'лояльность', 'tier', 'план', 'подписка', 'уровень', 'loyalty', 'segment', 'bronze', 'silver', 'gold', 'enterprise', 'smb'],
    matches: [
      { docId: '3', fields: ['segment', 'loyalty_tier'] },
      { docId: '23', fields: ['id'] }, // billing.subscription
    ],
  },
  // --- Дата / Время / Период ---
  {
    concept: 'дата',
    keywords: ['дата', 'время', 'период', 'месяц', 'день', 'год', 'когда', 'регистрация', 'создан'],
    matches: [
      { docId: '1', fields: ['sign_date'] },
      { docId: '3', fields: ['contract_start_date', 'contract_end_date', 'created_at', 'last_activity_at', 'verification_date'] },
      { docId: '4', fields: ['created_at'] },
      { docId: '31', fields: ['created_at'] },
    ],
  },
  // --- Продажи / Выручка ---
  {
    concept: 'продажи',
    keywords: ['продажи', 'выручка', 'revenue', 'доход', 'оборот', 'заказ', 'order', 'сумма', 'деньги', 'amount'],
    matches: [
      { docId: '3', fields: ['total_orders', 'total_revenue'] },
      { docId: '6', fields: ['id'] }, // daily_revenue_agg
      { docId: '4', fields: ['amount', 'settlement_id'] },
    ],
  },
  // --- Продавец / Селлер ---
  {
    concept: 'продавец',
    keywords: ['продавец', 'seller', 'селлер', 'мерчант', 'поставщик', 'партнёр'],
    matches: [
      { docId: '1', fields: ['seller_code', 'product_type'] },
      { docId: '19', fields: ['id'] }, // affiliate_commissions
    ],
  },
  // --- Продукт / Товар ---
  {
    concept: 'продукт',
    keywords: ['продукт', 'товар', 'product', 'каталог', 'sku', 'артикул', 'номенклатура'],
    matches: [
      { docId: '1', fields: ['product_type'] },
      { docId: '14', fields: ['id'] }, // product_catalog_snapshot
    ],
  },
  // --- Маркетинг / UTM ---
  {
    concept: 'маркетинг',
    keywords: ['маркетинг', 'utm', 'канал', 'channel', 'рекламa', 'трафик', 'источник', 'привлечение', 'атрибуция'],
    matches: [
      { docId: '3', fields: ['channel', 'utm_source'] },
      { docId: '7', fields: ['id'] }, // utm_attribution_raw
    ],
  },
  // --- Менеджер / Сотрудник ---
  {
    concept: 'менеджер',
    keywords: ['менеджер', 'сотрудник', 'manager', 'ответственный', 'куратор', 'hr'],
    matches: [
      { docId: '3', fields: ['manager_id', 'manager_name'] },
      { docId: '5', fields: ['id'] }, // employee_onboarding
      { docId: '2', fields: ['id'] }, // huntflow
    ],
  },
  // --- Договор / Контракт ---
  {
    concept: 'договор',
    keywords: ['договор', 'контракт', 'contract', 'соглашение', 'подписание'],
    matches: [
      { docId: '3', fields: ['contract_number', 'contract_start_date', 'contract_end_date'] },
      { docId: '1', fields: ['sign_date'] },
    ],
  },
  // --- Риск / Скоринг ---
  {
    concept: 'риск',
    keywords: ['риск', 'скоринг', 'risk', 'score', 'оценка', 'балл', 'верификация', 'fraud', 'мошенничество'],
    matches: [
      { docId: '3', fields: ['risk_score', 'is_verified', 'verification_date'] },
      { docId: '26', fields: ['id'] }, // fraud.suspicious_activity
    ],
  },
  // --- Статус ---
  {
    concept: 'статус',
    keywords: ['статус', 'status', 'состояние', 'state', 'этап', 'стадия'],
    matches: [
      { docId: '4', fields: ['status'] },
      { docId: '31', fields: ['status'] },
      { docId: '2', fields: ['sync_status', 'is_active'] },
    ],
  },
  // --- Расчёты / Платежи ---
  {
    concept: 'платежи',
    keywords: ['платёж', 'платеж', 'расчёт', 'расчет', 'settlement', 'payment', 'транзакция', 'оплата', 'сверка'],
    matches: [
      { docId: '4', fields: ['settlement_id', 'status', 'amount'] },
      { docId: '13', fields: ['id'] }, // transaction_reconciliation
    ],
  },
  // --- Справочник ---
  {
    concept: 'справочник',
    keywords: ['справочник', 'dictionary', 'словарь', 'каталог', 'классификатор', 'huntflow'],
    matches: [
      { docId: '2', fields: ['dictionary_name', 'dictionary_code', 'value', 'category', 'subcategory'] },
    ],
  },
  // --- Доставка / Логистика ---
  {
    concept: 'доставка',
    keywords: ['доставка', 'логистика', 'delivery', 'sla', 'курьер', 'отправка', 'склад'],
    matches: [
      { docId: '8', fields: ['id'] },
      { docId: '20', fields: ['id'] }, // warehouse.inventory
    ],
  },
  // --- Воронка / Конверсия ---
  {
    concept: 'воронка',
    keywords: ['воронка', 'конверсия', 'funnel', 'conversion', 'cr', 'этап воронки'],
    matches: [
      { docId: '12', fields: ['id'] },
    ],
  },
];

/**
 * Шаблоны составных запросов — частые комбинации бизнес-задач
 */
export const queryTemplates = [
  {
    query: 'Клиенты по регионам',
    description: 'Связь клиентской базы с географией',
    concepts: ['клиент', 'регион'],
  },
  {
    query: 'Клиенты по тарифам и регионам',
    description: 'Сегментация клиентов по тарифному плану и региону',
    concepts: ['клиент', 'тариф', 'регион'],
  },
  {
    query: 'Выручка по регионам за период',
    description: 'Анализ дохода в разрезе географии и времени',
    concepts: ['продажи', 'регион', 'дата'],
  },
  {
    query: 'Конверсия воронки по каналам',
    description: 'Эффективность маркетинговых каналов',
    concepts: ['воронка', 'маркетинг'],
  },
  {
    query: 'Скоринг клиентов по сегментам',
    description: 'Риск-оценка в разрезе клиентских сегментов',
    concepts: ['риск', 'тариф', 'клиент'],
  },
  {
    query: 'Платежи и расчёты за месяц',
    description: 'Финансовые операции за выбранный период',
    concepts: ['платежи', 'дата'],
  },
];
