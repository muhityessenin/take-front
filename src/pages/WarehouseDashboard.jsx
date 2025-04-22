// Версия с формой добавления товара и подтверждением продажи
import React, { useState, useEffect } from "react";
import {
    Container,
    Typography,
    TextField,
    Button,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Box,
    Avatar,
    Chip,
    Stack,
    useMediaQuery,
    useTheme,
    IconButton,
    MenuItem,
    Select,
    InputLabel,
    FormControl
} from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import axios from "axios";
const token = localStorage.getItem("authToken");

const BRANDS = [
    "Toyota", "Honda", "Nissan", "Mazda", "Mitsubishi",
    "Hyundai", "Kia", "Chevrolet", "Changan",  "Ford", "Volkswagen",
    "Mercedes", "BMW", "Audi", "Lexus", "Subaru",
    "Skoda", "Peugeot", "Renault", "Opel", "Volvo",
    "Suzuki", "Daewoo", "Chery", "Geely", "FAW"
];

export default function WarehouseDashboard() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const [searchTerm, setSearchTerm] = useState("");
    const [inventory, setInventory] = useState([]);
    const [availableBrands, setAvailableBrands] = useState([]);
    const [selectedBrand, setSelectedBrand] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [showSellModal, setShowSellModal] = useState(false);
    const [itemToSell, setItemToSell] = useState(null);
    const [saleQuantity, setSaleQuantity] = useState(1);
    const [customer, setCustomer] = useState("");
    const [newItem, setNewItem] = useState({
        name: "",
        partNumber: "",
        brand: "",
        model: "",
        stock: "",
        price: "",
        wholesalePrice: "",
        images: []
    });
    const [imageModal, setImageModal] = useState({ open: false, images: [], index: 0 });

    const fetchItems = async (brand = "") => {
        try {
            const url = brand ? `https://take-backend-yibv.onrender.com/api/items?brand=${encodeURIComponent(brand)}` : "https://take-backend-yibv.onrender.com/api/items";
            const res = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const items = res.data;
            setInventory(items);
            const brands = Array.from(new Set(items.map(item => item.brand).filter(Boolean)));
            setAvailableBrands(brands);
        } catch (err) {
            console.error("Ошибка при загрузке данных:", err);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleBrandFilter = (brand) => {
        setSelectedBrand(brand);
        fetchItems(brand);
    };

    const handleAddItem = () => {
        setShowAddModal(true);
    };

    const handleSubmitNewItem = async () => {
        try {
            if (newItem.id) {
                await axios.patch(
                    `https://take-backend-yibv.onrender.com/api/items/${newItem.id}`,
                    newItem,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("authToken")}`
                        }
                    }
                );
            } else {
                await axios.post(
                    "https://take-backend-yibv.onrender.com/api/items",
                    {
                        name: newItem.name,
                        model: newItem.model,
                        partNumber: newItem.partNumber,
                        brand: newItem.brand,
                        stock: Number(newItem.stock),
                        price: Number(newItem.price),
                        wholesalePrice: Number(newItem.wholesalePrice),
                        images: []
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("authToken")}`
                        }
                    }
                );
            }

            setShowAddModal(false);
            setNewItem({ name: "", model: "", partNumber: "", brand: "", stock: "", price: "", wholesalePrice: "", images: [] });
            fetchItems(selectedBrand);
        } catch (error) {
            console.error("Ошибка при добавлении/обновлении товара:", error);
        }
    };

    const handleEditItem = (item) => {
        setNewItem(item);
        setShowAddModal(true);
    };

    const openImageViewer = (images) => {
        if (images?.length > 0) {
            setImageModal({ open: true, images, index: 0 });
        }
    };

    const closeImageViewer = () => {
        setImageModal({ open: false, images: [], index: 0 });
    };

    const handleNextImage = () => {
        setImageModal((prev) => ({ ...prev, index: (prev.index + 1) % prev.images.length }));
    };

    const handlePrevImage = () => {
        setImageModal((prev) => ({ ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length }));
    };

    const openSellDialog = (item) => {
        setItemToSell(item);
        setSaleQuantity(1);
        setCustomer("");
        setShowSellModal(true);
    };

    const handleConfirmSale = async () => {
        try {
            console.log({
                itemId: itemToSell.id,
                quantity: Number(saleQuantity),
                customer: customer
            });
            await axios.post(
                "https://take-backend-yibv.onrender.com/api/sale",
                {
                    itemId: itemToSell.id,
                    quantity: saleQuantity,
                    customer: customer
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("authToken")}`
                    }
                }
            );

            setShowSellModal(false);
            fetchItems(selectedBrand);
        } catch (error) {
            console.error("Ошибка при продаже товара:", error);
        }
    };

    return (
        <Container sx={{ mt: 4 }} maxWidth="xl">
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexDirection={{ xs: 'column', md: 'row' }} gap={2}>
                <TextField
                    fullWidth
                    label="Поиск по товарам"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Box display="flex" gap={1} flexShrink={0}>
                    <Button variant="contained" onClick={handleAddItem}>
                        Добавить товар
                    </Button>
                    <Button variant="outlined" onClick={() => window.location.href = '/sales'}>
                        Продажи
                    </Button>
                </Box>
            </Box>


            <Box mb={2}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Фильтр по марке:</Typography>
                <Box
                    display="flex"
                    flexWrap="wrap"
                    gap={1.5}
                    mt={1}
                    sx={{
                        rowGap: 1.5,
                        columnGap: 1.5,
                        alignItems: "center"
                    }}
                >
                    <Chip
                        label="Все"
                        variant={selectedBrand === "" ? "filled" : "outlined"}
                        color={selectedBrand === "" ? "primary" : "default"}
                        onClick={() => handleBrandFilter("")}
                    />
                    {availableBrands.map((brand) => (
                        <Chip
                            key={brand}
                            label={brand}
                            variant={selectedBrand === brand ? "filled" : "outlined"}
                            color={selectedBrand === brand ? "primary" : "default"}
                            onClick={() => handleBrandFilter(brand)}
                        />
                    ))}
                </Box>

            </Box>

            <Box sx={{ overflowX: 'auto' }}>
                <Table sx={{ minWidth: 1000 }} size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Фото</TableCell>
                            <TableCell>Название</TableCell>
                            <TableCell>Модель</TableCell>
                            <TableCell>Марка</TableCell>
                            <TableCell>Остаток</TableCell>
                            <TableCell>Цена</TableCell>
                            <TableCell>Оптом цена</TableCell>
                            <TableCell>Артикул</TableCell>
                            <TableCell>Действие</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {inventory.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
                            <TableRow key={item.id} hover>
                                <TableCell>
                                    <Avatar src={item.images?.[0]?.url || ""} alt={item.name} sx={{ width: 50, height: 50, cursor: 'pointer' }} variant="rounded" onClick={() => openImageViewer(item.images)} />
                                </TableCell>
                                <TableCell>{item.name}</TableCell>

                                <TableCell>{item.brand}</TableCell>
                                <TableCell>{item.model}</TableCell>
                                <TableCell>{item.stock}</TableCell>
                                <TableCell>{item.price}</TableCell>
                                <TableCell>{item.wholesalePrice || "-"}</TableCell>
                                <TableCell>{item.partNumber}</TableCell>
                                <TableCell>
                                    <Stack direction="column" spacing={1}>
                                        <Button size="small" variant="outlined" onClick={() => openSellDialog(item)}>Продать</Button>
                                        <Button size="small" variant="contained" onClick={() => handleEditItem(item)}>Изменить</Button>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Box>

            <Dialog open={showAddModal} onClose={() => setShowAddModal(false)} fullWidth maxWidth="sm">
                <DialogTitle>Добавить новый товар</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} mt={1}>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Название" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Модель" value={newItem.model} onChange={(e) => setNewItem({ ...newItem, model: e.target.value })} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Артикул" value={newItem.partNumber} onChange={(e) => setNewItem({ ...newItem, partNumber: e.target.value })} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Марка</InputLabel>
                                <Select
                                    value={newItem.brand}
                                    label="Марка"
                                    onChange={(e) => setNewItem({ ...newItem, brand: e.target.value })}
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                width: 250, // увеличенная ширина выпадающего списка
                                                maxHeight: 300
                                            }
                                        }
                                    }}
                                    sx={{
                                        minWidth: 180  // увеличивает ширину поля перед кликом
                                    }}
                                >
                                    {BRANDS.map(brand => (
                                        <MenuItem key={brand} value={brand}>{brand}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Остаток"
                                type="text"
                                inputMode="numeric"
                                value={newItem.stock}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^\d*$/.test(value)) {
                                        setNewItem({ ...newItem, stock: value });
                                    }
                                }}
                            />

                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Цена"
                                type="text"
                                inputMode="numeric"
                                value={newItem.price}
                                defaultChecked={false}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^\d*$/.test(value)) {
                                        setNewItem({ ...newItem, price: value });
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Оптом цена"
                                type="text"
                                inputMode="numeric"
                                value={newItem.wholesalePrice}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^\d*$/.test(value)) {
                                        setNewItem({ ...newItem, wholesalePrice: value });
                                    }
                                }}
                            />
                        </Grid>

                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowAddModal(false)}>Отмена</Button>
                    <Button variant="contained" onClick={handleSubmitNewItem}>Сохранить</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={showSellModal} onClose={() => setShowSellModal(false)} fullWidth maxWidth="xs">
                <DialogTitle>Продажа товара</DialogTitle>
                <DialogContent>
                    <Typography mb={2}>Товар: {itemToSell?.name}</Typography>
                    <TextField
                        fullWidth
                        label="Количество"
                        type="text"
                        inputMode="numeric"
                        value={saleQuantity}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (/^\d*$/.test(value)) {
                                setSaleQuantity(value);
                            }
                        }}
                        sx={{ mb: 2 }}
                    />

                    <TextField fullWidth label="Покупатель" value={customer} onChange={(e) => setCustomer(e.target.value)} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowSellModal(false)}>Отмена</Button>
                    <Button variant="contained" onClick={handleConfirmSale}>Подтвердить</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={imageModal.open} onClose={closeImageViewer} maxWidth="md" fullWidth>
                <DialogTitle>Фото товара</DialogTitle>
                <DialogContent sx={{ textAlign: 'center' }}>
                    {imageModal.images.length > 0 && (
                        <Box>
                            <img
                                src={imageModal.images[imageModal.index].url}
                                alt="item"
                                style={{ maxWidth: '100%', maxHeight: '500px', borderRadius: 8 }}
                            />
                            <Box mt={2} display="flex" justifyContent="center" alignItems="center" gap={2}>
                                <IconButton onClick={handlePrevImage}><ArrowBack /></IconButton>
                                <Typography>{`${imageModal.index + 1} из ${imageModal.images.length}`}</Typography>
                                <IconButton onClick={handleNextImage}><ArrowForward /></IconButton>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>
        </Container>
    );
}