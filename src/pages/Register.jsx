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
    useTheme
} from "@mui/material";
import axios from "axios";

export default function RegisterPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleRegister = async () => {
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
                />

                <TextField
                    label="Пароль"
                    type="password"
                    fullWidth
                    margin="normal"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleRegister}
                >
                    Зарегистрироваться
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
