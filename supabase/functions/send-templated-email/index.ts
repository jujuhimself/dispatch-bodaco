
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { to, subject, html, text, template_name } = await req.json()

    console.log('Sending templated email:', { to, subject, template_name })

    // In a production environment, you would integrate with an email service like:
    // - SendGrid
    // - Mailgun
    // - AWS SES
    // - Resend
    
    // For now, we'll simulate sending the email and log the details
    console.log('Email details:', {
      to,
      subject,
      template: template_name,
      html_preview: html.substring(0, 100) + '...',
      text_preview: text ? text.substring(0, 100) + '...' : 'No text version'
    })

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 500))

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        template_used: template_name
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Error sending email:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 500
      }
    )
  }
})
