import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Trophy, Lightbulb, Search, Rocket, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { validateEmail, validatePassword } from '@/utils/validation';

export const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const { login, register, resetPassword, updatePassword, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryPassword, setRecoveryPassword] = useState('');
  const [recoveryConfirmPassword, setRecoveryConfirmPassword] = useState('');

  const validateLoginForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!loginForm.email) {
      errors.email = 'Email é obrigatório';
    } else if (!validateEmail(loginForm.email)) {
      errors.email = 'Email inválido';
    }
    
    if (!loginForm.password) {
      errors.password = 'Senha é obrigatória';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateRegisterForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!registerForm.name.trim()) {
      errors.name = 'Nome é obrigatório';
    } else if (registerForm.name.trim().length < 2) {
      errors.name = 'Nome deve ter pelo menos 2 caracteres';
    }
    
    if (!registerForm.email) {
      errors.email = 'Email é obrigatório';
    } else if (!validateEmail(registerForm.email)) {
      errors.email = 'Email inválido';
    }
    
    if (!registerForm.password) {
      errors.password = 'Senha é obrigatória';
    } else {
      const passwordValidation = validatePassword(registerForm.password);
      if (!passwordValidation.isValid) {
        errors.password = passwordValidation.errors[0];
      }
    }
    
    if (!registerForm.confirmPassword) {
      errors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (registerForm.password !== registerForm.confirmPassword) {
      errors.confirmPassword = 'Senhas não coincidem';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (!validateLoginForm()) return;
    
    const success = await login({ email: loginForm.email, password: loginForm.password });
    if (success) {
      navigate('/');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (!validateRegisterForm()) return;
    
    const success = await register(registerForm);
    if (success) {
      navigate('/');
    }
  };

  const handleTabChange = () => {
    clearError();
    setValidationErrors({});
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (!resetEmail) {
      setValidationErrors({ resetEmail: 'Email é obrigatório' });
      return;
    }
    
    if (!validateEmail(resetEmail)) {
      setValidationErrors({ resetEmail: 'Email inválido' });
      return;
    }
    
    const success = await resetPassword(resetEmail);
    if (success) {
      alert('Senha temporária enviada! Verifique seu email e use-a para fazer login.');
      setShowForgotPassword(false);
      setResetEmail('');
    }
  };

  // Fluxo de recuperação: definir nova senha
  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const errors: Record<string, string> = {};

    if (!recoveryPassword) {
      errors.recoveryPassword = 'Senha é obrigatória';
    } else {
      const validation = validatePassword(recoveryPassword);
      if (!validation.isValid) {
        errors.recoveryPassword = validation.errors[0];
      }
    }

    if (!recoveryConfirmPassword) {
      errors.recoveryConfirmPassword = 'Confirmação de senha é obrigatória';
    } else if (recoveryPassword !== recoveryConfirmPassword) {
      errors.recoveryConfirmPassword = 'Senhas não coincidem';
    }

    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const ok = await updatePassword({ currentPassword: '', newPassword: recoveryPassword, confirmPassword: recoveryConfirmPassword });
    if (ok) {
      alert('Senha atualizada com sucesso!');
      setShowRecovery(false);
      setRecoveryPassword('');
      setRecoveryConfirmPassword('');
      navigate('/');
    }
  };

  // Detecta link de recuperação ao entrar na página
  React.useEffect(() => {
    const hash = window.location.hash || '';
    const params = new URLSearchParams(window.location.search);
    if (hash.includes('type=recovery') || params.get('type') === 'recovery') {
      setShowRecovery(true);
      try {
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch {}
    }
  }, []);

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Hero */}
      <div className="hidden lg:flex lg:flex-1 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <motion.div 
          className="relative z-10 flex flex-col justify-center px-12 text-white"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="mb-8">
            <motion.div
              className="flex items-center gap-3 mb-6"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-white/20 rounded-lg p-3">
                <Trophy className="h-8 w-8" />
              </div>
              <h1 className="text-3xl font-bold">ActiveLearn Hub</h1>
            </motion.div>
            
            <motion.p 
              className="text-xl text-white/90 mb-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Transforme desafios em oportunidades de aprendizagem através da metodologia CBL
            </motion.p>
          </div>

          <motion.div 
            className="space-y-6"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center gap-4">
              <div className="bg-white/20 rounded-lg p-2">
                <Lightbulb className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">Engage</h3>
                <p className="text-white/80 text-sm">Defina problemas e desafios relevantes</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-white/20 rounded-lg p-2">
                <Search className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">Investigate</h3>
                <p className="text-white/80 text-sm">Pesquise e analise informações profundamente</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-white/20 rounded-lg p-2">
                <Rocket className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">Act</h3>
                <p className="text-white/80 text-sm">Desenvolva e implemente soluções inovadoras</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Right Panel - Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-background overflow-y-auto">
        <motion.div
          className="w-full max-w-md"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <Card className="card-elevated">
            <CardHeader className="text-center p-4 sm:p-6">
              <div className="flex items-center justify-center gap-2 mb-4 lg:hidden">
                <div className="gradient-primary rounded-lg p-2">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-base sm:text-lg">ActiveLearn Hub</span>
              </div>
              <CardTitle className="text-xl sm:text-2xl">Bem-vindo!</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Entre ou crie sua conta para começar sua jornada de aprendizagem
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <Tabs defaultValue="login" className="w-full" onValueChange={handleTabChange}>
                <TabsList className="grid w-full grid-cols-2 h-9 sm:h-10">
                  <TabsTrigger value="login">Entrar</TabsTrigger>
                  <TabsTrigger value="register">Cadastrar</TabsTrigger>
                </TabsList>
                
                {error && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                        disabled={isLoading}
                      />
                      {validationErrors.email && (
                        <p className="text-sm text-destructive">{validationErrors.email}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password">Senha</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Sua senha"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {validationErrors.password && (
                        <p className="text-sm text-destructive">{validationErrors.password}</p>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full gradient-primary text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Entrando...
                        </>
                      ) : (
                        'Entrar'
                      )}
                    </Button>
                    
                    <div className="text-center mt-4">
                      <Button
                        type="button"
                        variant="link"
                        className="text-sm text-muted-foreground hover:text-primary"
                        onClick={() => setShowForgotPassword(true)}
                      >
                        Esqueceu sua senha?
                      </Button>
                    </div>
                  </form>
                </TabsContent>
                
                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome completo</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Seu nome"
                        value={registerForm.name}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, name: e.target.value }))}
                        disabled={isLoading}
                      />
                      {validationErrors.name && (
                        <p className="text-sm text-destructive">{validationErrors.name}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                        disabled={isLoading}
                      />
                      {validationErrors.email && (
                        <p className="text-sm text-destructive">{validationErrors.email}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Senha</Label>
                      <div className="relative">
                        <Input
                          id="register-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Mínimo 8 caracteres"
                          value={registerForm.password}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {validationErrors.password && (
                        <p className="text-sm text-destructive">{validationErrors.password}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-confirm-password">Confirmar senha</Label>
                      <Input
                        id="register-confirm-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirme sua senha"
                        value={registerForm.confirmPassword}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        disabled={isLoading}
                      />
                      {validationErrors.confirmPassword && (
                        <p className="text-sm text-destructive">{validationErrors.confirmPassword}</p>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full gradient-primary text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Criando conta...
                        </>
                      ) : (
                        'Criar conta'
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
              
              {/* Modal de Recuperação de Senha */}
              {showForgotPassword && (
                <motion.div
                  className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowForgotPassword(false)}
                >
                  <motion.div
                    className="bg-background rounded-lg p-6 w-full max-w-md"
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.95 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3 className="text-lg font-semibold mb-4">Recuperar Senha</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Digite seu email para receber um link de recuperação de senha.
                    </p>
                    
                    {error && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="reset-email">Email</Label>
                        <Input
                          id="reset-email"
                          type="email"
                          placeholder="seu@email.com"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          disabled={isLoading}
                        />
                        {validationErrors.resetEmail && (
                          <p className="text-sm text-destructive">{validationErrors.resetEmail}</p>
                        )}
                      </div>
                      
                      <div className="flex gap-2 justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowForgotPassword(false)}
                          disabled={isLoading}
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="submit"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Enviando...
                            </>
                          ) : (
                            'Enviar'
                          )}
                        </Button>
                      </div>
                    </form>
                  </motion.div>
                </motion.div>
              )}

              {/* Modal de Nova Senha (Recuperação) */}
              {showRecovery && (
                <motion.div
                  className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowRecovery(false)}
                >
                  <motion.div
                    className="bg-background rounded-lg p-6 w-full max-w-md"
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.95 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3 className="text-lg font-semibold mb-4">Definir nova senha</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Digite e confirme sua nova senha para concluir a recuperação.
                    </p>

                    {error && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <form onSubmit={handleRecoverySubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-password">Nova senha</Label>
                        <Input
                          id="new-password"
                          type="password"
                          placeholder="Mínimo 8 caracteres"
                          value={recoveryPassword}
                          onChange={(e) => setRecoveryPassword(e.target.value)}
                          disabled={isLoading}
                        />
                        {validationErrors.recoveryPassword && (
                          <p className="text-sm text-destructive">{validationErrors.recoveryPassword}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="new-password-confirm">Confirmar nova senha</Label>
                        <Input
                          id="new-password-confirm"
                          type="password"
                          placeholder="Confirme sua nova senha"
                          value={recoveryConfirmPassword}
                          onChange={(e) => setRecoveryConfirmPassword(e.target.value)}
                          disabled={isLoading}
                        />
                        {validationErrors.recoveryConfirmPassword && (
                          <p className="text-sm text-destructive">{validationErrors.recoveryConfirmPassword}</p>
                        )}
                      </div>

                      <div className="flex gap-2 justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowRecovery(false)}
                          disabled={isLoading}
                        >
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Salvando...
                            </>
                          ) : (
                            'Salvar nova senha'
                          )}
                        </Button>
                      </div>
                    </form>
                  </motion.div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};