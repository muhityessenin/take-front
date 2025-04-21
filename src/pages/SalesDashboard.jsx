// Полный переписанный вариант с загрузкой продаж через API (исправлено отображение)
import React, { useState, useEffect } from "react";
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
    Autocomplete
} from "@mui/material";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell
} from "recharts";
import axios from "axios";

export default function SalesDashboard() {
    const [sales, setSales] = useState([]);
    const todayStr = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
    const [startDate, setStartDate] = useState(todayStr);
    const [endDate, setEndDate] = useState(todayStr);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [availableBrands, setAvailableBrands] = useState(["Toyota", "Honda", "Nissan", "Mazda", "Mitsubishi",
        "Hyundai", "Kia", "Chevrolet", "Changan",  "Ford", "Volkswagen",
        "Mercedes", "BMW", "Audi", "Lexus", "Subaru",
        "Skoda", "Peugeot", "Renault", "Opel", "Volvo",
        "Suzuki", "Daewoo", "Chery", "Geely", "FAW"]);

    useEffect(() => {
        axios.get("https://take-backend-yibv.onrender.com/api/sales/today")
            .then((res) => {
                const formatted = res.data.map((s) => {
                    const date = new Date(s.soldAt);
                    return {
                        id: s.id,
                        itemName: s.Item?.name || "",
                        category: s.Item?.brand || "",
                        quantity: s.quantity,
                        unitPrice: s.Item?.price || 0,
                        totalPrice: s.totalPrice,
                        date: date.toISOString().slice(0, 10) // YYYY-MM-DD
                    };
                });
                setSales(formatted);
                if (formatted.length > 0) {
                    setStartDate(formatted[0].date);
                    setEndDate(formatted[0].date);
                }
                const brands = Array.from(new Set(formatted.map(s => s.category).filter(Boolean)));
                setAvailableBrands(brands);
            })
            .catch((err) => console.error("Ошибка при загрузке продаж:", err));
    }, []);

    const filteredSales = sales.filter((sale) => {
        const saleDate = new Date(sale.date);
        const from = startDate ? new Date(startDate) : null;
        const to = endDate ? new Date(endDate) : null;
        const matchesDate = (!from || saleDate >= from) && (!to || saleDate <= to);
        const matchesText = sale.itemName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(sale.category);
        return matchesDate && matchesText && matchesBrand;
    });

    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.totalPrice, 0);
    const totalQuantity = filteredSales.reduce((sum, sale) => sum + sale.quantity, 0);

    const itemTotals = {};
    filteredSales.forEach((sale) => {
        itemTotals[sale.itemName] = (itemTotals[sale.itemName] || 0) + sale.quantity;
    });

    const bestSellersData = Object.entries(itemTotals)
        .map(([name, quantity]) => ({ name, quantity }))
        .sort((a, b) => b.quantity - a.quantity);

    const revenueByDateMap = {};
    filteredSales.forEach((sale) => {
        revenueByDateMap[sale.date] = (revenueByDateMap[sale.date] || 0) + sale.totalPrice;
    });

    const revenueByDateData = Object.entries(revenueByDateMap)
        .map(([date, revenue]) => ({ date, revenue }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    const categoryRevenueMap = {};
    filteredSales.forEach((sale) => {
        categoryRevenueMap[sale.category] = (categoryRevenueMap[sale.category] || 0) + sale.totalPrice;
    });

    const categoryRevenueData = Object.entries(categoryRevenueMap).map(([category, revenue]) => ({ category, revenue }));

    return (
        <Container sx={{ py: 4, maxWidth: 'lg', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Grid container spacing={2} mb={2} justifyContent="center">
                {[{
                    title: 'Общая выручка', value: totalRevenue
                }, {
                    title: 'Проданных товаров', value: totalQuantity
                }, {
                    title: 'Самый продаваемый товар', value: bestSellersData.length > 0 ? `${bestSellersData[0].name} (${bestSellersData[0].quantity} шт)` : '-'
                }].map((block, i) => (
                    <Grid item xs={12} md={4} key={i}>
                        <Card sx={{ borderRadius: 3, height: '100%' }}>
                            <CardContent>
                                <Typography variant="h6" align="center">{block.title}</Typography>
                                <Typography variant="h5" align="center">{block.value}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Card sx={{ mb: 4, borderRadius: 3, width: '100%' }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom align="center">Фильтры</Typography>
                    <Grid container spacing={2} justifyContent="center">
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField fullWidth label="С даты" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField fullWidth label="По дату" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField fullWidth label="Поиск по названию" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Autocomplete
                                multiple
                                options={availableBrands}
                                value={selectedBrands}
                                onChange={(e, newValue) => setSelectedBrands(newValue)}
                                renderInput={(params) => (
                                    <TextField {...params} label="Марка" placeholder="Выбрать" />
                                )}
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Card sx={{ mb: 4, borderRadius: 3, width: '100%' }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>График выручки по датам</Typography>
                    <Box sx={{ height: { xs: 250, sm: 300 } }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={revenueByDateData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip /><Legend /><Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} /></LineChart>
                        </ResponsiveContainer>
                    </Box>
                </CardContent>
            </Card>

            <Grid container spacing={2} mb={2} justifyContent="center">
                <Grid item xs={12} md={6}><Card sx={{ borderRadius: 3 }}><CardContent><Typography variant="h6" gutterBottom>Топ продаваемых товаров</Typography><Box sx={{ height: { xs: 250, sm: 300 } }}><ResponsiveContainer width="100%" height="100%"><BarChart data={bestSellersData.slice(0, 5)}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Legend /><Bar dataKey="quantity" fill="#1976d2" barSize={35} /></BarChart></ResponsiveContainer></Box></CardContent></Card></Grid>
                <Grid item xs={12} md={6}><Card sx={{ borderRadius: 3 }}><CardContent><Typography variant="h6" gutterBottom>Выручка по категориям</Typography><Box sx={{ height: { xs: 250, sm: 300 } }}><ResponsiveContainer width="100%" height="100%"><PieChart><Pie dataKey="revenue" data={categoryRevenueData} outerRadius={90} label={(entry) => entry.category}>{categoryRevenueData.map((entry, index) => (<Cell key={`cell-${index}`} />))}</Pie><Tooltip /></PieChart></ResponsiveContainer></Box></CardContent></Card></Grid>
            </Grid>

            <Card sx={{ borderRadius: 3, width: '100%' }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>Все продажи</Typography>
                    <Box sx={{ overflowX: 'auto' }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Товар</TableCell>
                                    <TableCell>Категория</TableCell>
                                    <TableCell>Кол-во</TableCell>
                                    <TableCell>Цена за шт</TableCell>
                                    <TableCell>Сумма</TableCell>
                                    <TableCell>Дата</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredSales.map((sale) => (
                                    <TableRow key={sale.id}>
                                        <TableCell>{sale.itemName}</TableCell>
                                        <TableCell>{sale.category}</TableCell>
                                        <TableCell>{sale.quantity}</TableCell>
                                        <TableCell>{sale.unitPrice}</TableCell>
                                        <TableCell>{sale.totalPrice}</TableCell>
                                        <TableCell>{sale.date}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
}