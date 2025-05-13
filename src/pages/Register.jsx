import React, { useState } from "react";
import {
    Box,
    Button,
    Container,
    TextField,
    Typography,
    Link,
    Paper,
    useMediaQuery,
    useTheme,
    CircularProgress
} from "@mui/material";
import axios from "axios";

export default function RegisterPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false); // состояние загрузки

    const handleRegister = async () => {
        setLoading(true);
        try {
            const response = await axios.post("https://take-backend-yibv.onrender.com/api/register", {
                username,
                password
            });

            const token = response.data.token;
            localStorage.setItem("authToken", token);
            window.location.href = "/login";
        } catch (error) {
            if (error.response && error.response.status === 400) {
                alert("Пользователь уже существует или ошибка данных");
            } else {
                console.error(error);
                alert("Ошибка при регистрации. Попробуйте позже");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="100vh"
            bgcolor="#f4f6f8"
            px={2}
        >
            <Paper elevation={3} sx={{ padding: 4, maxWidth: 400, width: '100%' }}>
                <Typography variant="h5" align="center" gutterBottom>
                    Регистрация
                </Typography>

                <TextField
                    label="Имя пользователя"
                    fullWidth
                    margin="normal"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                />

                <TextField
                    label="Пароль"
                    type="password"
                    fullWidth
                    margin="normal"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                />

                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleRegister}
                    disabled={loading}
                    startIcon={loading && <CircularProgress size={20} />}
                >
                    {loading ? "Регистрируем..." : "Зарегистрироваться"}
                </Button>

                <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                    Уже есть аккаунт?{' '}
                    <Link href="/login" underline="hover">
                        Войдите
                    </Link>
                </Typography>
            </Paper>
        </Box>
    );
}
