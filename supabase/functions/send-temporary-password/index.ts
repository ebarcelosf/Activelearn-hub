import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

// Implementação básica de envio de email usando fetch
async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  
  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY não configurada');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: "ActiveLearn Hub <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erro no Resend: ${error}`);
  }
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};



// Função para gerar senha temporária
function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();
    console.log('Iniciando processo de senha temporária para:', email);

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email é obrigatório' }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    // Criar cliente Supabase com Service Role Key para operações administrativas
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verificar se o usuário existe
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error('Erro ao listar usuários:', userError);
      return new Response(
        JSON.stringify({ error: 'Erro interno do servidor' }),
        { 
          status: 500, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    const user = users.users.find(u => u.email === email);
    
    if (!user) {
      console.log('Usuário não encontrado:', email);
      // Por segurança, retornamos sucesso mesmo se o usuário não existir
      return new Response(
        JSON.stringify({ success: true, message: 'Se o email existir, você receberá uma senha temporária.' }),
        { 
          status: 200, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    // Gerar senha temporária
    const tempPassword = generateTemporaryPassword();
    console.log('Senha temporária gerada para:', email);

    // Atualizar a senha do usuário
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: tempPassword }
    );

    if (updateError) {
      console.error('Erro ao atualizar senha:', updateError);
      return new Response(
        JSON.stringify({ error: 'Erro ao processar solicitação' }),
        { 
          status: 500, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    // Enviar email com a senha temporária
    await sendEmail(
      email,
      'Sua senha temporária - ActiveLearn Hub',
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin-bottom: 10px;">ActiveLearn Hub</h1>
            <p style="color: #6b7280; font-size: 16px;">Sua senha temporária</p>
          </div>
          
          <div style="background: #f8fafc; border-radius: 8px; padding: 25px; margin-bottom: 25px;">
            <h2 style="color: #1f2937; margin-bottom: 15px;">Senha temporária gerada</h2>
            <p style="color: #4b5563; margin-bottom: 20px;">
              Você solicitou uma senha temporária para acessar sua conta. Use a senha abaixo para fazer login:
            </p>
            
            <div style="background: white; border: 2px solid #e5e7eb; border-radius: 6px; padding: 15px; text-align: center; margin: 20px 0;">
              <code style="font-size: 18px; font-weight: bold; color: #1f2937; letter-spacing: 2px;">${tempPassword}</code>
            </div>
            
            <p style="color: #ef4444; font-size: 14px; margin-top: 15px;">
              <strong>Importante:</strong> Por segurança, recomendamos que você altere esta senha após fazer login.
            </p>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px;">
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 10px;">
              Se você não solicitou esta senha, pode ignorar este email com segurança.
            </p>
            <p style="color: #6b7280; font-size: 14px;">
              Esta senha expira em 24 horas.
            </p>
          </div>
        </div>
      `
    );

    console.log('Email enviado com sucesso para:', email);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Senha temporária enviada por email. Verifique sua caixa de entrada.' 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Erro na função send-temporary-password:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);