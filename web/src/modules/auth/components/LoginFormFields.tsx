'use client'

import VisibilityOffOutlined from '@mui/icons-material/VisibilityOffOutlined'
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLogin } from '../hooks/useLogin'
import { TextField, TextFieldLabel, TextFieldStack } from '@/modules/form'
import { extractTenantSlugFromHost } from '@/lib/auth/session'
import { useAppSnackbar } from '@/providers'

type LoginFormData = {
  email: string
  password: string
}

export function LoginFormFields() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const loginMutation = useLogin()
  const { showError } = useAppSnackbar()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const handleTogglePassword = () => {
    setShowPassword((previousValue) => !previousValue)
  }

  const onSubmit = async (data: LoginFormData) => {
    const condominiumSlug = extractTenantSlugFromHost(
      typeof window === 'undefined' ? null : window.location.host,
    )

    try {
      await loginMutation.mutateAsync({
        condominiumSlug: condominiumSlug ?? undefined,
        email: data.email,
        password: data.password,
      })

      router.refresh()
      router.push('/dashboard')
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Nao foi possivel realizar o login.')
    }
  }

  return (
    <Stack sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 4, sm: 5.5 } }}>
      <Stack spacing={0.75} alignItems="center">
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 1,
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'primary.contrastText',
            fontFamily: 'var(--font-plus-jakarta-sans), "Plus Jakarta Sans", sans-serif',
            fontWeight: 800,
            fontSize: 20,
          }}
        >
          C
        </Box>

        <Typography variant="h3" component="h1" textAlign="center" sx={{ mt: 0.75 }}>
          Controle
          <Box component="span" sx={{ color: 'primary.main' }}>
            Portaria
          </Box>
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Acesse o painel administrativo
        </Typography>
      </Stack>

      <Stack spacing={3.5} component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
        <TextFieldStack>
          <TextFieldLabel required>E-mail</TextFieldLabel>
          <TextField
            type="email"
            placeholder="seu@email.com"
            autoComplete="email"
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
            {...register('email', {
              required: 'Informe seu e-mail.',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Informe um e-mail valido.',
              },
            })}
          />
        </TextFieldStack>

        <TextFieldStack>
          <TextFieldLabel required>Senha</TextFieldLabel>
          <TextField
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            autoComplete="current-password"
            error={Boolean(errors.password)}
            helperText={errors.password?.message}
            {...register('password', {
              required: 'Informe sua senha.',
              minLength: {
                value: 8,
                message: 'A senha deve ter pelo menos 8 caracteres.',
              },
            })}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    type="button"
                    onClick={handleTogglePassword}
                    edge="end"
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? <VisibilityOffOutlined /> : <VisibilityOutlined />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </TextFieldStack>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          disabled={isSubmitting || loginMutation.isPending}
        >
          {isSubmitting || loginMutation.isPending ? 'Entrando...' : 'Entrar'}
        </Button>
      </Stack>
    </Stack>
  )
}
