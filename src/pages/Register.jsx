"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import {
    Box,
    TextField,
    Typography,
    Button,
    Stack,
    useMediaQuery,
    useTheme,
    Link,
    CircularProgress,
    Paper,
    InputAdornment,
    IconButton,
    Divider,
} from "@mui/material"
import { Visibility, VisibilityOff, Person, Lock, DirectionsCar, AppRegistration } from "@mui/icons-material"

export default function RegisterPage() {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [mounted, setMounted] = useState(false)

    // Устанавливаем mounted в true после монтирования компонента
    useEffect(() => {
        setMounted(true)
    }, [])

    const handleRegister = async () => {
        setLoading(true)
        try {
            const response = await axios.post("https://take-backend-yibv.onrender.com/api/register", {
                username,
                password,
            })

            const token = response.data.token
            localStorage.setItem("authToken", token)
            window.location.href = "/login"
        } catch (error) {
            if (error.response && error.response.status === 400) {
                alert("Пользователь уже существует или ошибка данных")
            } else {
                console.error(error)
                alert("Ошибка при регистрации. Попробуйте позже")
            }
        } finally {
            setLoading(false)
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleRegister()
        }
    }

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                background: "linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%)",
                padding: 2,
                opacity: mounted ? 1 : 0,
                transition: "opacity 0.8s ease-in-out",
            }}
        >
            <Paper
                elevation={4}
                sx={{
                    width: "100%",
                    maxWidth: 400,
                    borderRadius: 3,
                    overflow: "hidden",
                }}
            >
                {/* Верхняя часть с логотипом */}
                <Box
                    sx={{
                        bgcolor: "#1e3a8a",
                        color: "white",
                        py: 3,
                        px: 4,
                        textAlign: "center",
                        position: "relative",
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mb: 1,
                        }}
                    >
                        <DirectionsCar sx={{ fontSize: 40, mr: 1 }} />
                        <Typography variant="h4" component="h1" sx={{ fontWeight: "bold" }}>
                            DragonAuto
                        </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Система управления автоскладом
                    </Typography>
                </Box>

                {/* Форма регистрации */}
                <Box sx={{ p: 4 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                        <AppRegistration sx={{ color: "#1e3a8a", mr: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: "medium", color: "#1e3a8a" }}>
                            Регистрация нового пользователя
                        </Typography>
                    </Box>

                    <Stack spacing={3}>
                        <TextField
                            label="Имя пользователя"
                            variant="outlined"
                            fullWidth
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={loading}
                            onKeyPress={handleKeyPress}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Person color="action" />
                                    </InputAdornment>
                                ),
                                sx: {
                                    borderRadius: 2,
                                },
                            }}
                        />

                        <TextField
                            label="Пароль"
                            type={showPassword ? "text" : "password"}
                            variant="outlined"
                            fullWidth
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            onKeyPress={handleKeyPress}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock color="action" />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                                sx: {
                                    borderRadius: 2,
                                },
                            }}
                        />

                        <Typography variant="body2" color="text.secondary" sx={{ mt: -1 }}>
                            Пароль должен содержать не менее 6 символов
                        </Typography>

                        <Button
                            variant="contained"
                            fullWidth
                            onClick={handleRegister}
                            disabled={loading || !username || password.length < 6}
                            sx={{
                                bgcolor: "#1e3a8a",
                                "&:hover": { bgcolor: "#1e40af" },
                                py: 1.5,
                                borderRadius: 2,
                                textTransform: "none",
                                fontSize: "1rem",
                                boxShadow: 2,
                                mt: 2,
                            }}
                        >
                            {loading ? (
                                <>
                                    <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                                    Регистрируем...
                                </>
                            ) : (
                                "Зарегистрироваться"
                            )}
                        </Button>

                        <Divider sx={{ my: 1 }} />

                        <Typography variant="body2" align="center" color="text.secondary">
                            Уже есть аккаунт?{" "}
                            <Link
                                href="/login"
                                underline="hover"
                                sx={{
                                    color: "#1e3a8a",
                                    fontWeight: "medium",
                                    textDecoration: "none",
                                    "&:hover": {
                                        textDecoration: "underline",
                                    },
                                }}
                            >
                                Войдите
                            </Link>
                        </Typography>
                    </Stack>
                </Box>
            </Paper>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 4, opacity: 0.7 }}>
                © {new Date().getFullYear()} DragonAuto. Все права защищены.
            </Typography>
        </Box>
    )
}
