import { useState, useEffect } from "react"
import {
    Container,
    Typography,
    TextField,
    Card,
    CardContent,
    Grid,
    Box,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Autocomplete,
    Paper,
    AppBar,
    Toolbar,
    IconButton,
    Button,
    Chip,
    Divider,
    CircularProgress,
    TableContainer,
    TablePagination,
    useTheme,
    useMediaQuery,
    InputAdornment,
    Tabs,
    Tab,
    Tooltip,
    Avatar,
    Alert,
    Snackbar,
} from "@mui/material"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
} from "recharts"
import {
    ArrowBack,
    CalendarMonth,
    Search,
    FilterList,
    Refresh,
    TrendingUp,
    ReceiptLong,
    DirectionsCar,
    Inventory,
    Dashboard,
    BarChart as BarChartIcon,
    PieChart as PieChartIcon,
    ShowChart,
    Download,
    Print,
} from "@mui/icons-material"
import axios from "axios"

// Цветовая палитра для графиков
const CHART_COLORS = [
    "#1e3a8a", // Основной синий
    "#0284c7", // Голубой
    "#0891b2", // Бирюзовый
    "#4f46e5", // Индиго
    "#7c3aed", // Фиолетовый
    "#c026d3", // Пурпурный
    "#db2777", // Розовый
    "#e11d48", // Красный
    "#ea580c", // Оранжевый
    "#ca8a04", // Янтарный
    "#65a30d", // Лаймовый
    "#16a34a", // Зеленый
]

export default function SalesDashboard() {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
    const isTablet = useMediaQuery(theme.breakpoints.down("md"))

    const [sales, setSales] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const todayStr = new Date().toISOString().slice(0, 10)
    const [startDate, setStartDate] = useState(todayStr)
    const [endDate, setEndDate] = useState(todayStr)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedBrands, setSelectedBrands] = useState([])
    const [availableBrands, setAvailableBrands] = useState([])

    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [tabValue, setTabValue] = useState(0)
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" })

    // Функция для форматирования чисел с разделителями тысяч
    const formatNumber = (num) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
    }

    // Функция для форматирования даты в более читаемый формат
    const formatDate = (dateStr) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" })
    }

    useEffect(() => {
        fetchSales()
    }, [])

    const fetchSales = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem("authToken")

            const res = await axios.get("https://take-backend-yibv.onrender.com/api/sales", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            const formatted = res.data.map((s) => {
                const date = new Date(s.soldAt)
                return {
                    id: s.id,
                    itemName: s.Item?.name || "",
                    category: s.Item?.brand || "",
                    quantity: s.quantity,
                    unitPrice: s.Item?.price || 0,
                    totalPrice: s.totalPrice,
                    date: date.toISOString().slice(0, 10),
                    formattedDate: formatDate(date),
                }
            })

            setSales(formatted)

            if (formatted.length > 0) {
                // Находим самую раннюю дату продажи для установки начальной даты фильтра
                const dates = formatted.map((s) => new Date(s.date))
                const earliestDate = new Date(Math.min(...dates))
                setStartDate(earliestDate.toISOString().slice(0, 10))
                setEndDate(todayStr)
            }

            const brands = Array.from(new Set(formatted.map((s) => s.category).filter(Boolean)))
            setAvailableBrands(brands)
            setLoading(false)
        } catch (err) {
            console.error("Ошибка при загрузке продаж:", err)
            setError("Не удалось загрузить данные о продажах")
            setLoading(false)
            setSnackbar({
                open: true,
                message: "Ошибка при загрузке данных о продажах",
                severity: "error",
            })
        }
    }

    const handleChangePage = (event, newPage) => {
        setPage(newPage)
    }

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(Number.parseInt(event.target.value, 10))
        setPage(0)
    }

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue)
    }

    const handleResetFilters = () => {
        if (sales.length > 0) {
            const dates = sales.map((s) => new Date(s.date))
            const earliestDate = new Date(Math.min(...dates))
            setStartDate(earliestDate.toISOString().slice(0, 10))
        } else {
            setStartDate(todayStr)
        }
        setEndDate(todayStr)
        setSearchTerm("")
        setSelectedBrands([])
    }

    const filteredSales = sales.filter((sale) => {
        const saleDate = new Date(sale.date)
        const from = startDate ? new Date(startDate) : null
        const to = endDate ? new Date(endDate) : null
        const matchesDate = (!from || saleDate >= from) && (!to || saleDate <= to)
        const matchesText = sale.itemName.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(sale.category)
        return matchesDate && matchesText && matchesBrand
    })

    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.totalPrice, 0)
    const totalQuantity = filteredSales.reduce((sum, sale) => sum + sale.quantity, 0)
    const averageOrderValue = filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0

    // Данные для графиков
    const itemTotals = {}
    filteredSales.forEach((sale) => {
        itemTotals[sale.itemName] = (itemTotals[sale.itemName] || 0) + sale.quantity
    })

    const bestSellersData = Object.entries(itemTotals)
        .map(([name, quantity]) => ({ name, quantity }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10) // Ограничиваем топ-10 для лучшей визуализации

    const revenueByDateMap = {}
    filteredSales.forEach((sale) => {
        revenueByDateMap[sale.date] = (revenueByDateMap[sale.date] || 0) + sale.totalPrice
    })

    const revenueByDateData = Object.entries(revenueByDateMap)
        .map(([date, revenue]) => ({
            date: formatDate(date),
            revenue,
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date))

    const categoryRevenueMap = {}
    filteredSales.forEach((sale) => {
        categoryRevenueMap[sale.category || "Без категории"] =
            (categoryRevenueMap[sale.category || "Без категории"] || 0) + sale.totalPrice
    })

    const categoryRevenueData = Object.entries(categoryRevenueMap)
        .map(([category, revenue]) => ({
            category,
            revenue,
            percentage: ((revenue / totalRevenue) * 100).toFixed(1) + "%",
        }))
        .sort((a, b) => b.revenue - a.revenue)

    // Данные для таблицы с пагинацией
    const paginatedSales = filteredSales.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

    // Кастомный тултип для графиков
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <Paper sx={{ p: 2, boxShadow: 3, bgcolor: "rgba(255, 255, 255, 0.95)" }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        {label}
                    </Typography>
                    {payload.map((entry, index) => (
                        <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                            <Box sx={{ width: 12, height: 12, bgcolor: entry.color, borderRadius: "50%" }} />
                            <Typography variant="body2">
                                {entry.name}: {entry.name === "revenue" ? `${formatNumber(entry.value)} ₸` : entry.value}
                            </Typography>
                        </Box>
                    ))}
                </Paper>
            )
        }
        return null
    }

    return (
        <>
            <AppBar position="static" sx={{ backgroundColor: "#1e3a8a", boxShadow: 3 }}>
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="back"
                        onClick={() => (window.location.href = "/")}
                        sx={{ mr: 2 }}
                    >
                        <ArrowBack />
                    </IconButton>
                    <DirectionsCar sx={{ mr: 2, fontSize: 32 }} />
                    <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: "bold" }}>
                        DragonAuto
                    </Typography>
                    <Button color="inherit" startIcon={<Inventory />} onClick={() => (window.location.href = "/")}>
                        Склад
                    </Button>
                </Toolbar>
            </AppBar>

            <Container sx={{ py: 4 }} maxWidth="xl">
                <Box sx={{ mb: 4 }}>
                    <Typography
                        variant="h4"
                        sx={{ mb: 1, fontWeight: "bold", color: "#1e3a8a", display: "flex", alignItems: "center" }}
                    >
                        <Dashboard sx={{ mr: 1, fontSize: 32 }} /> Аналитика продаж
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Анализ продаж, статистика и отчеты по автозапчастям
                    </Typography>
                </Box>

                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="400px">
                        <CircularProgress sx={{ color: "#1e3a8a" }} />
                    </Box>
                ) : error ? (
                    <Alert severity="error" sx={{ mb: 4 }}>
                        {error}
                    </Alert>
                ) : (
                    <>
                        {/* Карточки с ключевыми показателями */}
                        <Grid container spacing={3} mb={4}>
                            <Grid item xs={12} md={4}>
                                <Card
                                    sx={{
                                        borderRadius: 3,
                                        height: "100%",
                                        boxShadow: 3,
                                        background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
                                        color: "white",
                                    }}
                                >
                                    <CardContent sx={{ p: 3 }}>
                                        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                            <Avatar sx={{ bgcolor: "rgba(255, 255, 255, 0.2)", mr: 2 }}>
                                                <TrendingUp />
                                            </Avatar>
                                            <Typography variant="h6">Общая выручка</Typography>
                                        </Box>
                                        <Typography variant="h4" sx={{ mb: 1, fontWeight: "bold" }}>
                                            {formatNumber(totalRevenue)} ₸
                                        </Typography>
                                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                            За выбранный период
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <Card
                                    sx={{
                                        borderRadius: 3,
                                        height: "100%",
                                        boxShadow: 2,
                                        border: "1px solid #e2e8f0",
                                    }}
                                >
                                    <CardContent sx={{ p: 3 }}>
                                        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                            <Avatar sx={{ bgcolor: "#0284c7", mr: 2 }}>
                                                <Inventory />
                                            </Avatar>
                                            <Typography variant="h6" color="text.primary">
                                                Продано товаров
                                            </Typography>
                                        </Box>
                                        <Typography variant="h4" sx={{ mb: 1, fontWeight: "bold", color: "#0284c7" }}>
                                            {formatNumber(totalQuantity)} шт
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Общее количество проданных единиц
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <Card
                                    sx={{
                                        borderRadius: 3,
                                        height: "100%",
                                        boxShadow: 2,
                                        border: "1px solid #e2e8f0",
                                    }}
                                >
                                    <CardContent sx={{ p: 3 }}>
                                        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                            <Avatar sx={{ bgcolor: "#16a34a", mr: 2 }}>
                                                <ReceiptLong />
                                            </Avatar>
                                            <Typography variant="h6" color="text.primary">
                                                Средний чек
                                            </Typography>
                                        </Box>
                                        <Typography variant="h4" sx={{ mb: 1, fontWeight: "bold", color: "#16a34a" }}>
                                            {formatNumber(Math.round(averageOrderValue))} ₸
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Средняя стоимость продажи
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>

                        {/* Блок фильтров */}
                        <Paper
                            sx={{
                                mb: 4,
                                borderRadius: 3,
                                boxShadow: 2,
                                border: "1px solid #e2e8f0",
                                overflow: "hidden",
                            }}
                        >
                            <Box
                                sx={{
                                    p: 2,
                                    bgcolor: "#f8fafc",
                                    borderBottom: "1px solid #e2e8f0",
                                    display: "flex",
                                    alignItems: "center",
                                }}
                            >
                                <FilterList sx={{ mr: 1, color: "#1e3a8a" }} />
                                <Typography variant="h6" sx={{ fontWeight: "medium", color: "#1e3a8a" }}>
                                    Фильтры
                                </Typography>
                            </Box>

                            <Box sx={{ p: 3 }}>
                                <Grid container spacing={3} alignItems="center">
                                    <Grid item xs={12} sm={6} md={3}>
                                        <TextField
                                            fullWidth
                                            label="С даты"
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            InputLabelProps={{ shrink: true }}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <CalendarMonth fontSize="small" />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <TextField
                                            fullWidth
                                            label="По дату"
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            InputLabelProps={{ shrink: true }}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <CalendarMonth fontSize="small" />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <TextField
                                            fullWidth
                                            label="Поиск по названию"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Search fontSize="small" />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <Autocomplete
                                            multiple
                                            options={availableBrands}
                                            value={selectedBrands}
                                            onChange={(e, newValue) => setSelectedBrands(newValue)}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Марка"
                                                    placeholder="Выбрать"
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        startAdornment: (
                                                            <>
                                                                <InputAdornment position="start">
                                                                    <DirectionsCar fontSize="small" />
                                                                </InputAdornment>
                                                                {params.InputProps.startAdornment}
                                                            </>
                                                        ),
                                                    }}
                                                />
                                            )}
                                            renderTags={(value, getTagProps) =>
                                                value.map((option, index) => (
                                                    <Chip
                                                        key={index} // Added key property
                                                        label={option}
                                                        {...getTagProps({ index })}
                                                        sx={{
                                                            bgcolor: "#1e3a8a",
                                                            color: "white",
                                                            "& .MuiChip-deleteIcon": {
                                                                color: "white",
                                                                "&:hover": {
                                                                    color: "rgba(255, 255, 255, 0.7)",
                                                                },
                                                            },
                                                        }}
                                                    />
                                                ))
                                            }
                                        />
                                    </Grid>
                                </Grid>

                                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                                    <Button variant="outlined" startIcon={<Refresh />} onClick={handleResetFilters} sx={{ mr: 1 }}>
                                        Сбросить
                                    </Button>
                                    <Button
                                        variant="contained"
                                        startIcon={<FilterList />}
                                        sx={{
                                            bgcolor: "#1e3a8a",
                                            "&:hover": { bgcolor: "#1e40af" },
                                        }}
                                    >
                                        Применить
                                    </Button>
                                </Box>
                            </Box>
                        </Paper>

                        {/* Вкладки для переключения между графиками и таблицей */}
                        <Tabs
                            value={tabValue}
                            onChange={handleTabChange}
                            sx={{
                                mb: 3,
                                "& .MuiTab-root": {
                                    textTransform: "none",
                                    fontWeight: "medium",
                                    fontSize: "1rem",
                                },
                                "& .Mui-selected": {
                                    color: "#1e3a8a !important",
                                },
                                "& .MuiTabs-indicator": {
                                    backgroundColor: "#1e3a8a",
                                },
                            }}
                        >
                            <Tab label="Графики" icon={<BarChartIcon />} iconPosition="start" />
                            <Tab label="Таблица продаж" icon={<ReceiptLong />} iconPosition="start" />
                        </Tabs>

                        {tabValue === 0 ? (
                            <>
                                {/* График выручки по датам */}
                                <Paper
                                    sx={{
                                        mb: 4,
                                        p: 3,
                                        borderRadius: 3,
                                        boxShadow: 2,
                                        border: "1px solid #e2e8f0",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            mb: 2,
                                        }}
                                    >
                                        <Box sx={{ display: "flex", alignItems: "center" }}>
                                            <ShowChart sx={{ mr: 1, color: "#1e3a8a" }} />
                                            <Typography variant="h6" sx={{ fontWeight: "medium", color: "#1e3a8a" }}>
                                                Динамика выручки
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Tooltip title="Экспорт">
                                                <IconButton size="small" sx={{ mr: 1 }}>
                                                    <Download />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Печать">
                                                <IconButton size="small">
                                                    <Print />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </Box>

                                    <Divider sx={{ mb: 3 }} />

                                    <Box sx={{ height: 350 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={revenueByDateData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                                <XAxis
                                                    dataKey="date"
                                                    tick={{ fill: "#64748b" }}
                                                    axisLine={{ stroke: "#cbd5e1" }}
                                                    tickLine={{ stroke: "#cbd5e1" }}
                                                />
                                                <YAxis
                                                    tick={{ fill: "#64748b" }}
                                                    axisLine={{ stroke: "#cbd5e1" }}
                                                    tickLine={{ stroke: "#cbd5e1" }}
                                                    tickFormatter={(value) => `${value / 1000}K`}
                                                />
                                                <RechartsTooltip content={<CustomTooltip />} />
                                                <Legend />
                                                <Line
                                                    type="monotone"
                                                    dataKey="revenue"
                                                    name="Выручка"
                                                    stroke="#1e3a8a"
                                                    strokeWidth={3}
                                                    dot={{ r: 4, fill: "#1e3a8a", stroke: "#1e3a8a" }}
                                                    activeDot={{ r: 6, fill: "#1e3a8a", stroke: "white", strokeWidth: 2 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </Box>
                                </Paper>

                                {/* Графики: топ продаж и выручка по категориям */}
                                <Grid container spacing={3} mb={4}>
                                    <Grid item xs={12} md={6}>
                                        <Paper
                                            sx={{
                                                p: 3,
                                                borderRadius: 3,
                                                height: "100%",
                                                boxShadow: 2,
                                                border: "1px solid #e2e8f0",
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                    mb: 2,
                                                }}
                                            >
                                                <Box sx={{ display: "flex", alignItems: "center" }}>
                                                    <BarChartIcon sx={{ mr: 1, color: "#0284c7" }} />
                                                    <Typography variant="h6" sx={{ fontWeight: "medium", color: "#0284c7" }}>
                                                        Топ продаваемых товаров
                                                    </Typography>
                                                </Box>
                                                <Box>
                                                    <Tooltip title="Экспорт">
                                                        <IconButton size="small">
                                                            <Download />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </Box>

                                            <Divider sx={{ mb: 3 }} />

                                            <Box sx={{ height: 350 }}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={bestSellersData.slice(0, 5)}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                                        <XAxis
                                                            dataKey="name"
                                                            tick={{ fill: "#64748b" }}
                                                            axisLine={{ stroke: "#cbd5e1" }}
                                                            tickLine={{ stroke: "#cbd5e1" }}
                                                            tickFormatter={(value) => (value.length > 15 ? `${value.substring(0, 15)}...` : value)}
                                                        />
                                                        <YAxis
                                                            tick={{ fill: "#64748b" }}
                                                            axisLine={{ stroke: "#cbd5e1" }}
                                                            tickLine={{ stroke: "#cbd5e1" }}
                                                        />
                                                        <RechartsTooltip content={<CustomTooltip />} />
                                                        <Legend />
                                                        <Bar
                                                            dataKey="quantity"
                                                            name="Количество"
                                                            fill="#0284c7"
                                                            barSize={40}
                                                            radius={[4, 4, 0, 0]}
                                                        />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </Box>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Paper
                                            sx={{
                                                p: 3,
                                                borderRadius: 3,
                                                height: "100%",
                                                boxShadow: 2,
                                                border: "1px solid #e2e8f0",
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                    mb: 2,
                                                }}
                                            >
                                                <Box sx={{ display: "flex", alignItems: "center" }}>
                                                    <PieChartIcon sx={{ mr: 1, color: "#16a34a" }} />
                                                    <Typography variant="h6" sx={{ fontWeight: "medium", color: "#16a34a" }}>
                                                        Выручка по маркам
                                                    </Typography>
                                                </Box>
                                                <Box>
                                                    <Tooltip title="Экспорт">
                                                        <IconButton size="small">
                                                            <Download />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </Box>

                                            <Divider sx={{ mb: 3 }} />

                                            <Box sx={{ height: 350, display: "flex", alignItems: "center" }}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            dataKey="revenue"
                                                            data={categoryRevenueData}
                                                            cx="50%"
                                                            cy="50%"
                                                            outerRadius={120}
                                                            innerRadius={60}
                                                            paddingAngle={2}
                                                            label={({ category, percentage }) => `${category} (${percentage})`}
                                                            labelLine={true}
                                                        >
                                                            {categoryRevenueData.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <RechartsTooltip content={<CustomTooltip />} />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </Box>
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </>
                        ) : (
                            <Paper
                                sx={{
                                    borderRadius: 3,
                                    overflow: "hidden",
                                    boxShadow: 2,
                                    border: "1px solid #e2e8f0",
                                }}
                            >
                                <Box
                                    sx={{
                                        p: 2,
                                        bgcolor: "#f8fafc",
                                        borderBottom: "1px solid #e2e8f0",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <Box sx={{ display: "flex", alignItems: "center" }}>
                                        <ReceiptLong sx={{ mr: 1, color: "#1e3a8a" }} />
                                        <Typography variant="h6" sx={{ fontWeight: "medium", color: "#1e3a8a" }}>
                                            Список продаж
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Tooltip title="Экспорт">
                                            <IconButton size="small" sx={{ mr: 1 }}>
                                                <Download />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Печать">
                                            <IconButton size="small">
                                                <Print />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </Box>

                                <TableContainer>
                                    <Table sx={{ minWidth: 650 }}>
                                        <TableHead sx={{ bgcolor: "#f8fafc" }}>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: "bold" }}>Товар</TableCell>
                                                <TableCell sx={{ fontWeight: "bold" }}>Марка</TableCell>
                                                <TableCell sx={{ fontWeight: "bold" }}>Количество</TableCell>
                                                <TableCell sx={{ fontWeight: "bold" }}>Цена за шт</TableCell>
                                                <TableCell sx={{ fontWeight: "bold" }}>Сумма</TableCell>
                                                <TableCell sx={{ fontWeight: "bold" }}>Дата</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {paginatedSales.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                                        <Typography variant="body1" color="text.secondary">
                                                            Продажи не найдены
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                paginatedSales.map((sale) => (
                                                    <TableRow key={sale.id} hover>
                                                        <TableCell sx={{ fontWeight: "medium" }}>{sale.itemName}</TableCell>
                                                        <TableCell>
                                                            <Chip label={sale.category || "Без категории"} size="small" sx={{ bgcolor: "#f1f5f9" }} />
                                                        </TableCell>
                                                        <TableCell>{sale.quantity} шт</TableCell>
                                                        <TableCell>{formatNumber(sale.unitPrice)} ₸</TableCell>
                                                        <TableCell sx={{ fontWeight: "medium", color: "#16a34a" }}>
                                                            {formatNumber(sale.totalPrice)} ₸
                                                        </TableCell>
                                                        <TableCell>{sale.formattedDate}</TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>

                                <TablePagination
                                    rowsPerPageOptions={[5, 10, 25, 50]}
                                    component="div"
                                    count={filteredSales.length}
                                    rowsPerPage={rowsPerPage}
                                    page={page}
                                    onPageChange={handleChangePage}
                                    onRowsPerPageChange={handleChangeRowsPerPage}
                                    labelRowsPerPage="Строк на странице:"
                                    labelDisplayedRows={({ from, to, count }) => `${from}–${to} из ${count}`}
                                />
                            </Paper>
                        )}
                    </>
                )}
            </Container>

            {/* Уведомления */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    )
}
