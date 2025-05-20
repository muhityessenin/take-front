"use client"

// Версия с формой добавления товара и подтверждением продажи
import { useState, useEffect } from "react"

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
    FormControl,
    Paper,
    Divider,
    AppBar,
    Toolbar,
    Card,
    CardContent,
    InputAdornment,
    Badge,
    Tooltip,
    Tabs,
    Tab,
    CircularProgress,
    Snackbar,
    Alert,
} from "@mui/material"
import {
    ArrowBack,
    ArrowForward,
    Search,
    Add,
    Edit,
    ShoppingCart,
    Inventory,
    ReceiptLong,
    PhotoCamera,
    DirectionsCar,
    FilterList,
    Close,
    Refresh,
} from "@mui/icons-material"
import axios from "axios"
const token = localStorage.getItem("authToken")

const BRANDS = [
    "Toyota",
    "Honda",
    "Nissan",
    "Mazda",
    "Mitsubishi",
    "Hyundai",
    "Kia",
    "Chevrolet",
    "Changan",
    "Ford",
    "Volkswagen",
    "Mercedes",
    "BMW",
    "Audi",
    "Lexus",
    "Subaru",
    "Skoda",
    "Peugeot",
    "Renault",
    "Opel",
    "Volvo",
    "Suzuki",
    "Daewoo",
    "Chery",
    "Geely",
    "FAW",
]

export default function WarehouseDashboard() {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
    const isTablet = useMediaQuery(theme.breakpoints.down("md"))

    const [searchTerm, setSearchTerm] = useState("")
    const [inventory, setInventory] = useState([])
    const [availableBrands, setAvailableBrands] = useState([])
    const [selectedBrand, setSelectedBrand] = useState("")
    const [showAddModal, setShowAddModal] = useState(false)
    const [showSellModal, setShowSellModal] = useState(false)
    const [itemToSell, setItemToSell] = useState(null)
    const [saleQuantity, setSaleQuantity] = useState(1)
    const [customer, setCustomer] = useState("")
    const [loading, setLoading] = useState(true)
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" })
    const [newItem, setNewItem] = useState({
        name: "",
        partNumber: "",
        brand: "",
        model: "",
        stock: "",
        price: "",
        wholesalePrice: "",
        images: [],
        imageFiles: [],
        imagePreviews: [],
    })
    const [imageModal, setImageModal] = useState({ open: false, images: [], index: 0 })
    const [tabValue, setTabValue] = useState(0)

    const fetchItems = async (brand = "") => {
        try {
            setLoading(true)
            const url = brand
                ? `https://take-backend-yibv.onrender.com/api/items?brand=${encodeURIComponent(brand)}`
                : "https://take-backend-yibv.onrender.com/api/items"
            const res = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            const items = res.data
            setInventory(items)
            const brands = Array.from(new Set(items.map((item) => item.brand).filter(Boolean)))
            setAvailableBrands(brands)
            setLoading(false)
        } catch (err) {
            console.error("Ошибка при загрузке данных:", err)
            setSnackbar({
                open: true,
                message: "Ошибка при загрузке данных",
                severity: "error",
            })
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchItems()
    }, [])

    const handleBrandFilter = (brand) => {
        setSelectedBrand(brand)
        fetchItems(brand)
    }

    const handleAddItem = () => {
        setShowAddModal(true)
    }

    const handleSubmitNewItem = async () => {
        try {
            setLoading(true)
            const formData = new FormData()
            formData.append("name", newItem.name)
            formData.append("model", newItem.model)
            formData.append("partNumber", newItem.partNumber)
            formData.append("brand", newItem.brand)
            formData.append("stock", Number(newItem.stock))
            formData.append("price", Number(newItem.price))
            formData.append("wholesalePrice", Number(newItem.wholesalePrice))

            newItem.imageFiles.forEach((file) => {
                formData.append("images", file)
            })

            if (newItem.id) {
                await axios.patch(`https://take-backend-yibv.onrender.com/api/items/${newItem.id}`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                })
                setSnackbar({
                    open: true,
                    message: "Товар успешно обновлен",
                    severity: "success",
                })
            } else {
                await axios.post("https://take-backend-yibv.onrender.com/api/items", formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                })
                setSnackbar({
                    open: true,
                    message: "Товар успешно добавлен",
                    severity: "success",
                })
            }

            setShowAddModal(false)
            setNewItem({
                name: "",
                model: "",
                partNumber: "",
                brand: "",
                stock: "",
                price: "",
                wholesalePrice: "",
                images: [],
                imageFiles: [],
                imagePreviews: [],
            })
            fetchItems(selectedBrand)
        } catch (error) {
            console.error("Ошибка при добавлении/обновлении товара:", error)
            setSnackbar({
                open: true,
                message: "Ошибка при сохранении товара",
                severity: "error",
            })
            setLoading(false)
        }
    }

    const handleEditItem = (item) => {
        setNewItem({
            ...item,
            imageFiles: [],
            imagePreviews: [],
            images: item.images || [],
        })
        setShowAddModal(true)
    }

    const openImageViewer = (images) => {
        if (Array.isArray(images) && images.length > 0) {
            setImageModal({ open: true, images, index: 0 })
        } else {
            setSnackbar({
                open: true,
                message: "Нет изображений для просмотра",
                severity: "info",
            })
        }
    }

    const closeImageViewer = () => {
        setImageModal({ open: false, images: [], index: 0 })
    }

    const handleNextImage = () => {
        setImageModal((prev) => {
            if (!Array.isArray(prev.images) || prev.images.length === 0) return prev
            return {
                ...prev,
                index: (prev.index + 1) % prev.images.length,
            }
        })
    }

    const handlePrevImage = () => {
        setImageModal((prev) => {
            if (!Array.isArray(prev.images) || prev.images.length === 0) return prev
            return {
                ...prev,
                index: (prev.index - 1 + prev.images.length) % prev.images.length,
            }
        })
    }

    const openSellDialog = (item) => {
        setItemToSell(item)
        setSaleQuantity(1)
        setCustomer("")
        setShowSellModal(true)
    }

    const handleConfirmSale = async () => {
        try {
            setLoading(true)
            await axios.post(
                "https://take-backend-yibv.onrender.com/api/sale",
                {
                    itemId: itemToSell.id,
                    quantity: saleQuantity,
                    customer: customer,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                    },
                },
            )

            setShowSellModal(false)
            setSnackbar({
                open: true,
                message: "Продажа успешно оформлена",
                severity: "success",
            })
            fetchItems(selectedBrand)
        } catch (error) {
            console.error("Ошибка при продаже товара:", error)
            setSnackbar({
                open: true,
                message: "Ошибка при оформлении продажи",
                severity: "error",
            })
            setLoading(false)
        }
    }

    const handleRemoveImage = (index) => {
        setNewItem((prev) => {
            const newImagePreviews = [...prev.imagePreviews]
            const newImageFiles = [...prev.imageFiles]

            newImagePreviews.splice(index, 1)
            newImageFiles.splice(index, 1)

            return {
                ...prev,
                imagePreviews: newImagePreviews,
                imageFiles: newImageFiles,
            }
        })
    }

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue)
    }

    const filteredInventory = inventory.filter((item) => {
        const lowerTerm = searchTerm.toLowerCase()
        return (
            item.name.toLowerCase().includes(lowerTerm) ||
            (item.partNumber && item.partNumber.toLowerCase().includes(lowerTerm)) ||
            (item.brand && item.brand.toLowerCase().includes(lowerTerm)) ||
            (item.model && item.model.toLowerCase().includes(lowerTerm))
        )
    })

    return (
        <>
            <AppBar position="static" sx={{ backgroundColor: "#1e3a8a", boxShadow: 3 }}>
                <Toolbar>
                    <DirectionsCar sx={{ mr: 2, fontSize: 32 }} />
                    <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: "bold" }}>
                        DragonAuto
                    </Typography>
                    <Button color="inherit" startIcon={<ReceiptLong />} onClick={() => (window.location.href = "/sales")}>
                        Продажи
                    </Button>
                </Toolbar>
            </AppBar>

            <Container sx={{ mt: 4, mb: 4 }} maxWidth="xl">
                <Paper
                    sx={{
                        p: 0,
                        mb: 3,
                        borderRadius: 2,
                        boxShadow: 3,
                        background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
                        overflow: "hidden",
                    }}
                >
                    <Box sx={{ p: 3, color: "white" }}>
                        <Typography variant="h5" sx={{ mb: 1, fontWeight: "bold", display: "flex", alignItems: "center", gap: 1 }}>
                            <Inventory fontSize="large" /> Управление складом
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 3, opacity: 0.9 }}>
                            Поиск, добавление и управление товарами автосклада CarHouse
                        </Typography>
                    </Box>

                    <Box sx={{ bgcolor: "white", p: 3 }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={7}>
                                <TextField
                                    fullWidth
                                    placeholder="Поиск по названию, артикулу, марке или модели..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search color="primary" />
                                            </InputAdornment>
                                        ),
                                        endAdornment: searchTerm && (
                                            <InputAdornment position="end">
                                                <IconButton size="small" onClick={() => setSearchTerm("")}>
                                                    <Close fontSize="small" />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                        sx: {
                                            borderRadius: 2,
                                            height: 56,
                                            "& .MuiOutlinedInput-notchedOutline": {
                                                borderColor: "#e2e8f0",
                                                borderWidth: 2,
                                            },
                                            "&:hover .MuiOutlinedInput-notchedOutline": {
                                                borderColor: "#1e3a8a",
                                            },
                                        },
                                    }}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12} md={5}>
                                <Box display="flex" gap={2} justifyContent={{ xs: "flex-start", md: "flex-end" }}>
                                    <Button
                                        variant="contained"
                                        startIcon={<Add />}
                                        onClick={handleAddItem}
                                        sx={{
                                            bgcolor: "#1e3a8a",
                                            "&:hover": { bgcolor: "#1e40af" },
                                            borderRadius: 2,
                                            height: 56,
                                            px: 3,
                                            fontSize: "1rem",
                                            boxShadow: 3,
                                        }}
                                    >
                                        Добавить товар
                                    </Button>
                                    <Button
                                        variant="contained"
                                        startIcon={<Refresh />}
                                        onClick={() => fetchItems(selectedBrand)}
                                        sx={{
                                            borderRadius: 2,
                                            height: 56,
                                            bgcolor: "rgba(255, 255, 255, 0.9)",
                                            color: "#1e3a8a",
                                            "&:hover": {
                                                bgcolor: "rgba(255, 255, 255, 1)",
                                            },
                                            boxShadow: 2,
                                        }}
                                    >
                                        Обновить
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                </Paper>

                <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: 2 }}>
                    <Box display="flex" alignItems="center" mb={2}>
                        <FilterList sx={{ mr: 1, color: "#1e3a8a" }} />
                        <Typography variant="h6" sx={{ fontWeight: "medium", color: "#1e3a8a" }}>
                            Фильтр по марке
                        </Typography>
                    </Box>

                    <Box
                        display="flex"
                        flexWrap="wrap"
                        gap={1}
                        sx={{
                            rowGap: 1,
                            columnGap: 1,
                            alignItems: "center",
                        }}
                    >
                        <Chip
                            label="Все"
                            variant={selectedBrand === "" ? "filled" : "outlined"}
                            color={selectedBrand === "" ? "primary" : "default"}
                            onClick={() => handleBrandFilter("")}
                            sx={{
                                borderRadius: 1.5,
                                ...(selectedBrand === "" && { bgcolor: "#1e3a8a" }),
                            }}
                        />
                        {availableBrands.map((brand) => (
                            <Chip
                                key={brand}
                                label={brand}
                                variant={selectedBrand === brand ? "filled" : "outlined"}
                                color={selectedBrand === brand ? "primary" : "default"}
                                onClick={() => handleBrandFilter(brand)}
                                sx={{
                                    borderRadius: 1.5,
                                    ...(selectedBrand === brand && { bgcolor: "#1e3a8a" }),
                                }}
                            />
                        ))}
                    </Box>
                </Paper>

                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    sx={{
                        mb: 2,
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
                    <Tab label="Таблица" icon={<Inventory />} iconPosition="start" />
                    <Tab label="Карточки" icon={<DirectionsCar />} iconPosition="start" />
                </Tabs>

                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                        <CircularProgress sx={{ color: "#1e3a8a" }} />
                    </Box>
                ) : (
                    <>
                        {tabValue === 0 ? (
                            <Paper sx={{ borderRadius: 2, overflow: "hidden", boxShadow: 2 }}>
                                <Box sx={{ overflowX: "auto" }}>
                                    <Table sx={{ minWidth: 1000 }} size="medium">
                                        <TableHead sx={{ bgcolor: "#f8fafc" }}>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: "bold" }}>Фото</TableCell>
                                                <TableCell sx={{ fontWeight: "bold" }}>Название</TableCell>
                                                <TableCell sx={{ fontWeight: "bold" }}>Марка</TableCell>
                                                <TableCell sx={{ fontWeight: "bold" }}>Модель</TableCell>
                                                <TableCell sx={{ fontWeight: "bold" }}>Остаток</TableCell>
                                                <TableCell sx={{ fontWeight: "bold" }}>Цена</TableCell>
                                                <TableCell sx={{ fontWeight: "bold" }}>Оптом цена</TableCell>
                                                <TableCell sx={{ fontWeight: "bold" }}>Артикул</TableCell>
                                                <TableCell sx={{ fontWeight: "bold" }}>Действие</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredInventory.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                                                        <Typography variant="body1" color="text.secondary">
                                                            Товары не найдены
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredInventory.map((item) => (
                                                    <TableRow key={item.id} hover>
                                                        <TableCell>
                                                            <Badge
                                                                badgeContent={item.images?.length || 0}
                                                                color="primary"
                                                                anchorOrigin={{
                                                                    vertical: "top",
                                                                    horizontal: "right",
                                                                }}
                                                                sx={{
                                                                    "& .MuiBadge-badge": {
                                                                        bgcolor: "#1e3a8a",
                                                                        display: item.images?.length > 1 ? "flex" : "none",
                                                                    },
                                                                }}
                                                            >
                                                                <Avatar
                                                                    src={item.images?.[0]?.url || ""}
                                                                    alt={item.name}
                                                                    sx={{
                                                                        width: 60,
                                                                        height: 60,
                                                                        cursor: "pointer",
                                                                        borderRadius: 2,
                                                                        border: "1px solid #e2e8f0",
                                                                    }}
                                                                    variant="rounded"
                                                                    onClick={() => openImageViewer(item.images)}
                                                                />
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell sx={{ fontWeight: "medium" }}>{item.name}</TableCell>
                                                        <TableCell>{item.brand}</TableCell>
                                                        <TableCell>{item.model}</TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={item.stock}
                                                                color={item.stock > 5 ? "success" : item.stock > 0 ? "warning" : "error"}
                                                                size="small"
                                                                sx={{ fontWeight: "bold", minWidth: "60px" }}
                                                            />
                                                        </TableCell>
                                                        <TableCell sx={{ fontWeight: "medium" }}>{item.price} ₸</TableCell>
                                                        <TableCell>{item.wholesalePrice ? `${item.wholesalePrice} ₸` : "-"}</TableCell>
                                                        <TableCell>
                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    bgcolor: "#f1f5f9",
                                                                    p: 0.5,
                                                                    borderRadius: 1,
                                                                    display: "inline-block",
                                                                    fontFamily: "monospace",
                                                                }}
                                                            >
                                                                {item.partNumber || "-"}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Stack direction="row" spacing={1}>
                                                                <Tooltip title="Продать">
                                                                    <Button
                                                                        size="small"
                                                                        variant="outlined"
                                                                        onClick={() => openSellDialog(item)}
                                                                        sx={{
                                                                            minWidth: "unset",
                                                                            borderRadius: 1.5,
                                                                            color: "#0284c7",
                                                                            borderColor: "#0284c7",
                                                                            "&:hover": {
                                                                                borderColor: "#0284c7",
                                                                                bgcolor: "rgba(2, 132, 199, 0.04)",
                                                                            },
                                                                        }}
                                                                    >
                                                                        <ShoppingCart fontSize="small" />
                                                                    </Button>
                                                                </Tooltip>
                                                                <Tooltip title="Изменить">
                                                                    <Button
                                                                        size="small"
                                                                        variant="outlined"
                                                                        onClick={() => handleEditItem(item)}
                                                                        sx={{
                                                                            minWidth: "unset",
                                                                            borderRadius: 1.5,
                                                                            color: "#1e3a8a",
                                                                            borderColor: "#1e3a8a",
                                                                            "&:hover": {
                                                                                borderColor: "#1e3a8a",
                                                                                bgcolor: "rgba(30, 58, 138, 0.04)",
                                                                            },
                                                                        }}
                                                                    >
                                                                        <Edit fontSize="small" />
                                                                    </Button>
                                                                </Tooltip>
                                                            </Stack>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </Box>
                            </Paper>
                        ) : (
                            <Grid container spacing={3}>
                                {filteredInventory.length === 0 ? (
                                    <Grid item xs={12}>
                                        <Paper sx={{ p: 4, textAlign: "center", borderRadius: 2 }}>
                                            <Typography variant="body1" color="text.secondary">
                                                Товары не найдены
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                ) : (
                                    filteredInventory.map((item) => (
                                        <Grid item xs={12} sm={6} md={4} key={item.id}>
                                            <Card
                                                sx={{
                                                    height: 480, // Фиксированная высота для всех карточек
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    borderRadius: 2,
                                                    transition: "transform 0.2s, box-shadow 0.2s",
                                                    boxShadow: 2,
                                                    border: "1px solid #e2e8f0",
                                                    "&:hover": {
                                                        transform: "translateY(-4px)",
                                                        boxShadow: 4,
                                                        borderColor: "#1e3a8a",
                                                    },
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        position: "relative",
                                                        height: 220, // Фиксированная высота для изображения
                                                        bgcolor: "#f8fafc",
                                                        borderTopLeftRadius: 8,
                                                        borderTopRightRadius: 8,
                                                        overflow: "hidden",
                                                    }}
                                                    onClick={() => openImageViewer(item.images)}
                                                >
                                                    {item.images && item.images.length > 0 ? (
                                                        <img
                                                            src={item.images[0].url || "/placeholder.svg"}
                                                            alt={item.name}
                                                            style={{
                                                                position: "absolute",
                                                                top: 0,
                                                                left: 0,
                                                                width: "100%",
                                                                height: "100%",
                                                                objectFit: "contain",
                                                                padding: "8px",
                                                                cursor: "pointer",
                                                            }}
                                                        />
                                                    ) : (
                                                        <Box
                                                            sx={{
                                                                position: "absolute",
                                                                top: 0,
                                                                left: 0,
                                                                width: "100%",
                                                                height: "100%",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                            }}
                                                        >
                                                            <DirectionsCar sx={{ fontSize: 60, color: "#cbd5e1" }} />
                                                        </Box>
                                                    )}
                                                    {item.images && item.images.length > 1 && (
                                                        <Chip
                                                            label={`${item.images.length} фото`}
                                                            size="small"
                                                            sx={{
                                                                position: "absolute",
                                                                top: 8,
                                                                right: 8,
                                                                bgcolor: "rgba(30, 58, 138, 0.8)",
                                                                color: "white",
                                                            }}
                                                        />
                                                    )}
                                                </Box>
                                                <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                                                    <Typography variant="h6" component="div" sx={{ mb: 1, fontWeight: "medium" }}>
                                                        {item.name}
                                                    </Typography>

                                                    <Box sx={{ mb: 2 }}>
                                                        <Chip label={item.brand} size="small" sx={{ mr: 1, mb: 1, bgcolor: "#f1f5f9" }} />
                                                        {item.model && (
                                                            <Chip label={item.model} size="small" sx={{ mr: 1, mb: 1, bgcolor: "#f1f5f9" }} />
                                                        )}
                                                    </Box>

                                                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Артикул:
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                                                            {item.partNumber || "-"}
                                                        </Typography>
                                                    </Box>

                                                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Остаток:
                                                        </Typography>
                                                        <Chip
                                                            label={item.stock}
                                                            size="small"
                                                            color={item.stock > 5 ? "success" : item.stock > 0 ? "warning" : "error"}
                                                            sx={{ fontWeight: "bold", minWidth: "60px" }}
                                                        />
                                                    </Box>

                                                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Цена:
                                                        </Typography>
                                                        <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                                                            {item.price} ₸
                                                        </Typography>
                                                    </Box>

                                                    {item.wholesalePrice && (
                                                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Оптом:
                                                            </Typography>
                                                            <Typography variant="body2">{item.wholesalePrice} ₸</Typography>
                                                        </Box>
                                                    )}

                                                    <Box sx={{ display: "flex", gap: 1, mt: "auto" }}>
                                                        <Button
                                                            fullWidth
                                                            variant="contained"
                                                            startIcon={<ShoppingCart />}
                                                            onClick={() => openSellDialog(item)}
                                                            sx={{
                                                                bgcolor: "#0284c7",
                                                                "&:hover": { bgcolor: "#0369a1" },
                                                                borderRadius: 2,
                                                            }}
                                                        >
                                                            Продать
                                                        </Button>
                                                        <Button
                                                            fullWidth
                                                            variant="outlined"
                                                            startIcon={<Edit />}
                                                            onClick={() => handleEditItem(item)}
                                                            sx={{
                                                                color: "#1e3a8a",
                                                                borderColor: "#1e3a8a",
                                                                "&:hover": {
                                                                    borderColor: "#1e3a8a",
                                                                    bgcolor: "rgba(30, 58, 138, 0.04)",
                                                                },
                                                                borderRadius: 2,
                                                            }}
                                                        >
                                                            Изменить
                                                        </Button>
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))
                                )}
                            </Grid>
                        )}
                    </>
                )}
            </Container>

            {/* Модаль��ое окно добавления/редактирования товара */}
            <Dialog
                open={showAddModal}
                onClose={() => setShowAddModal(false)}
                fullWidth
                maxWidth="md"
                PaperProps={{
                    sx: { borderRadius: 3 },
                }}
            >
                <DialogTitle
                    sx={{
                        bgcolor: "#1e3a8a",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                    }}
                >
                    {newItem.id ? <Edit /> : <Add />}
                    {newItem.id ? "Редактирование товара" : "Добавление нового товара"}
                </DialogTitle>
                <DialogContent sx={{ p: 3, mt: 1 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: "medium" }}>
                                Основная информация
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Название"
                                        value={newItem.name}
                                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                        required
                                        sx={{ mb: 2 }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth sx={{ mb: 2 }}>
                                        <InputLabel>Марка *</InputLabel>
                                        <Select
                                            value={newItem.brand}
                                            label="Марка *"
                                            onChange={(e) => setNewItem({ ...newItem, brand: e.target.value })}
                                            required
                                            MenuProps={{
                                                PaperProps: {
                                                    sx: {
                                                        maxHeight: 300,
                                                    },
                                                },
                                            }}
                                        >
                                            {BRANDS.map((brand) => (
                                                <MenuItem key={brand} value={brand}>
                                                    {brand}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Модель"
                                        value={newItem.model}
                                        onChange={(e) => setNewItem({ ...newItem, model: e.target.value })}
                                        sx={{ mb: 2 }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Артикул"
                                        value={newItem.partNumber}
                                        onChange={(e) => setNewItem({ ...newItem, partNumber: e.target.value })}
                                        sx={{ mb: 2 }}
                                    />
                                </Grid>
                            </Grid>

                            <Typography variant="subtitle1" sx={{ mt: 3, mb: 2, fontWeight: "medium" }}>
                                Цены и наличие
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        fullWidth
                                        label="Остаток *"
                                        type="text"
                                        inputMode="numeric"
                                        value={newItem.stock}
                                        required
                                        onChange={(e) => {
                                            const value = e.target.value
                                            if (/^\d*$/.test(value)) {
                                                setNewItem({ ...newItem, stock: value })
                                            }
                                        }}
                                        InputProps={{
                                            endAdornment: <InputAdornment position="end">шт</InputAdornment>,
                                        }}
                                        sx={{ mb: 2 }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        fullWidth
                                        label="Цена *"
                                        type="text"
                                        inputMode="numeric"
                                        value={newItem.price}
                                        required
                                        onChange={(e) => {
                                            const value = e.target.value
                                            if (/^\d*$/.test(value)) {
                                                setNewItem({ ...newItem, price: value })
                                            }
                                        }}
                                        InputProps={{
                                            endAdornment: <InputAdornment position="end">₸</InputAdornment>,
                                        }}
                                        sx={{ mb: 2 }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        fullWidth
                                        label="Оптом цена"
                                        type="text"
                                        inputMode="numeric"
                                        value={newItem.wholesalePrice}
                                        onChange={(e) => {
                                            const value = e.target.value
                                            if (/^\d*$/.test(value)) {
                                                setNewItem({ ...newItem, wholesalePrice: value })
                                            }
                                        }}
                                        InputProps={{
                                            endAdornment: <InputAdornment position="end">₸</InputAdornment>,
                                        }}
                                        sx={{ mb: 2 }}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: "medium" }}>
                                Фотографии
                            </Typography>

                            <Button
                                variant="outlined"
                                component="label"
                                fullWidth
                                startIcon={<PhotoCamera />}
                                sx={{
                                    height: 56,
                                    borderStyle: "dashed",
                                    borderRadius: 2,
                                    mb: 2,
                                }}
                            >
                                ЗАГРУЗИТЬ ФОТО
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    hidden
                                    onChange={(e) => {
                                        const files = Array.from(e.target.files)
                                        const previews = files.map((file) => URL.createObjectURL(file))

                                        setNewItem((prev) => ({
                                            ...prev,
                                            imageFiles: [...prev.imageFiles, ...files],
                                            imagePreviews: [...prev.imagePreviews, ...previews],
                                        }))
                                    }}
                                />
                            </Button>

                            {/* Предпросмотр новых изображений */}
                            {newItem.imagePreviews.length > 0 && (
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }}>
                                        Новые фотографии:
                                    </Typography>
                                    <Grid container spacing={1}>
                                        {newItem.imagePreviews.map((src, index) => (
                                            <Grid item xs={4} sm={3} key={index}>
                                                <Box sx={{ position: "relative" }}>
                                                    <img
                                                        src={src || "/placeholder.svg"}
                                                        alt={`preview-${index}`}
                                                        style={{
                                                            width: "100%",
                                                            height: 100,
                                                            objectFit: "cover",
                                                            borderRadius: 8,
                                                            border: "1px solid #e2e8f0",
                                                        }}
                                                    />
                                                    <IconButton
                                                        size="small"
                                                        sx={{
                                                            position: "absolute",
                                                            top: -8,
                                                            right: -8,
                                                            bgcolor: "white",
                                                            border: "1px solid #e2e8f0",
                                                            "&:hover": { bgcolor: "#f1f5f9" },
                                                        }}
                                                        onClick={() => handleRemoveImage(index)}
                                                    >
                                                        <Close fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>
                            )}

                            {/* Существующие изображения */}
                            {newItem.id && newItem.images && newItem.images.length > 0 && (
                                <Box>
                                    <Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }}>
                                        Существующие фотографии:
                                    </Typography>
                                    <Grid container spacing={1}>
                                        {newItem.images.map((image, index) => (
                                            <Grid item xs={4} sm={3} key={index}>
                                                <img
                                                    src={image.url || "/placeholder.svg"}
                                                    alt={`existing-${index}`}
                                                    style={{
                                                        width: "100%",
                                                        height: 100,
                                                        objectFit: "cover",
                                                        borderRadius: 8,
                                                        border: "1px solid #e2e8f0",
                                                    }}
                                                />
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>
                            )}
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={() => setShowAddModal(false)} variant="outlined" sx={{ borderRadius: 2 }}>
                        Отмена
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmitNewItem}
                        disabled={!newItem.name || !newItem.brand || !newItem.stock || !newItem.price}
                        sx={{
                            bgcolor: "#1e3a8a",
                            "&:hover": { bgcolor: "#1e40af" },
                            borderRadius: 2,
                        }}
                    >
                        {newItem.id ? "Обновить" : "Сохранить"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Модальное окно продажи товара */}
            <Dialog
                open={showSellModal}
                onClose={() => setShowSellModal(false)}
                fullWidth
                maxWidth="xs"
                PaperProps={{
                    sx: { borderRadius: 3 },
                }}
            >
                <DialogTitle
                    sx={{
                        bgcolor: "#0284c7",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                    }}
                >
                    <ShoppingCart />
                    Продажа товара
                </DialogTitle>
                <DialogContent sx={{ p: 3, mt: 1 }}>
                    <Box sx={{ mb: 3, p: 2, bgcolor: "#f1f5f9", borderRadius: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: "medium", mb: 0.5 }}>
                            {itemToSell?.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {itemToSell?.brand} {itemToSell?.model}
                        </Typography>
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                            <Typography variant="body2">Доступно:</Typography>
                            <Chip
                                label={itemToSell?.stock || 0}
                                size="small"
                                color={itemToSell?.stock > 5 ? "success" : itemToSell?.stock > 0 ? "warning" : "error"}
                            />
                        </Box>
                    </Box>

                    <TextField
                        fullWidth
                        label="Количество"
                        type="text"
                        inputMode="numeric"
                        value={saleQuantity}
                        onChange={(e) => {
                            const value = e.target.value
                            if (/^\d*$/.test(value)) {
                                setSaleQuantity(value)
                            }
                        }}
                        InputProps={{
                            endAdornment: <InputAdornment position="end">шт</InputAdornment>,
                        }}
                        sx={{ mb: 2 }}
                    />

                    <TextField fullWidth label="Покупатель" value={customer} onChange={(e) => setCustomer(e.target.value)} />

                    {itemToSell && Number(saleQuantity) > 0 && (
                        <Box sx={{ mt: 3, p: 2, bgcolor: "#f1f5f9", borderRadius: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                Итого:
                            </Typography>
                            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                <Typography variant="body2">Цена за единицу:</Typography>
                                <Typography variant="body2">{itemToSell.price} ₸</Typography>
                            </Box>
                            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                                <Typography variant="body2">Количество:</Typography>
                                <Typography variant="body2">{saleQuantity} шт</Typography>
                            </Box>
                            <Divider sx={{ my: 1 }} />
                            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                <Typography variant="subtitle2">Общая сумма:</Typography>
                                <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                                    {itemToSell.price * Number(saleQuantity)} ₸
                                </Typography>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={() => setShowSellModal(false)} variant="outlined" sx={{ borderRadius: 2 }}>
                        Отмена
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleConfirmSale}
                        disabled={!saleQuantity || Number(saleQuantity) <= 0 || Number(saleQuantity) > (itemToSell?.stock || 0)}
                        sx={{
                            bgcolor: "#0284c7",
                            "&:hover": { bgcolor: "#0369a1" },
                            borderRadius: 2,
                        }}
                    >
                        Подтвердить
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Модальное окно просмотра изображений */}
            <Dialog
                open={imageModal.open}
                onClose={closeImageViewer}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3 },
                }}
            >
                <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="h6">Фото товара</Typography>
                    <IconButton onClick={closeImageViewer} size="small">
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ textAlign: "center", p: 0 }}>
                    {Array.isArray(imageModal.images) && imageModal.images.length > 0 && (
                        <Box sx={{ position: "relative", bgcolor: "#f8fafc", p: 2 }}>
                            <img
                                src={imageModal.images[imageModal.index].url || "/placeholder.svg"}
                                alt="item"
                                style={{
                                    maxWidth: "100%",
                                    maxHeight: "500px",
                                    objectFit: "contain",
                                    borderRadius: 8,
                                }}
                            />

                            <Box
                                sx={{
                                    position: "absolute",
                                    left: 16,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                }}
                            >
                                <IconButton
                                    onClick={handlePrevImage}
                                    sx={{
                                        bgcolor: "white",
                                        boxShadow: 2,
                                        "&:hover": { bgcolor: "#f1f5f9" },
                                    }}
                                >
                                    <ArrowBack />
                                </IconButton>
                            </Box>

                            <Box
                                sx={{
                                    position: "absolute",
                                    right: 16,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                }}
                            >
                                <IconButton
                                    onClick={handleNextImage}
                                    sx={{
                                        bgcolor: "white",
                                        boxShadow: 2,
                                        "&:hover": { bgcolor: "#f1f5f9" },
                                    }}
                                >
                                    <ArrowForward />
                                </IconButton>
                            </Box>
                        </Box>
                    )}

                    {Array.isArray(imageModal.images) && imageModal.images.length > 1 && (
                        <Box sx={{ p: 2, display: "flex", justifyContent: "center", gap: 1, flexWrap: "wrap" }}>
                            {imageModal.images.map((image, idx) => (
                                <Box
                                    key={idx}
                                    onClick={() => setImageModal((prev) => ({ ...prev, index: idx }))}
                                    sx={{
                                        width: 60,
                                        height: 60,
                                        borderRadius: 1,
                                        overflow: "hidden",
                                        border: idx === imageModal.index ? "2px solid #1e3a8a" : "1px solid #e2e8f0",
                                        cursor: "pointer",
                                    }}
                                >
                                    <img
                                        src={image.url || "/placeholder.svg"}
                                        alt={`thumbnail-${idx}`}
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                        }}
                                    />
                                </Box>
                            ))}
                        </Box>
                    )}
                </DialogContent>
            </Dialog>

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
