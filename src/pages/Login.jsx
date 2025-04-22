import React, { useState } from "react";
import axios from "axios";

import {
    Container,
    Box,
    TextField,
    Typography,
    Button,
    Stack,
    useMediaQuery,
    useTheme,
    Link
} from "@mui/material";

export default function LoginPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        try {
            const response = await axios.post("https://take-backend-yibv.onrender.com/api/login", {
                username,
                password
            });
            const token = response.data.token;

            // Сохраняем токен в localStorage
            localStorage.setItem("authToken", token);

            // Редирект на склад
            window.location.href = "/warehouse";
        } catch (error) {
            if (error.response && error.response.status === 401) {
                alert("Неправильный логин или пароль");
            } else {
                console.error(error);
                alert("Ошибка при входе. Попробуйте позже");
            }
        }
    };




    return (
        <Container maxWidth="xs">
            <Box
                minHeight="100vh"
                display="flex"
                justifyContent="center"
                alignItems="center"
            >
                <Box
                    sx={{
                        width: "100%",
                        backgroundColor: "white",
                        p: 4,
                        borderRadius: 2,
                        boxShadow: 3
                    }}
                >
                    <Typography variant="h5" mb={3} align="center" color="primary">
                        Вход в систему
                    </Typography>

                    <Stack spacing={2}>
                        <TextField
                            label="Логин"
                            variant="outlined"
                            fullWidth
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />

                        <TextField
                            label="Пароль"
                            type="password"
                            variant="outlined"
                            fullWidth
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <Button variant="contained" color="primary" fullWidth onClick={handleLogin}>
                            Войти
                        </Button>


                        <Typography variant="body2" align="center">
                            Нет аккаунта?{' '}
                            <Link href="/register" underline="hover">
                                Зарегистрируйтесь
                            </Link>
                        </Typography>
                    </Stack>
                </Box>
            </Box>
        </Container>
    );
}
