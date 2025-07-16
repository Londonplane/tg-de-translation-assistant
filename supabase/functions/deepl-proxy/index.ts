import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, apiKey, source_lang = 'DE', target_lang = 'ZH' } = await req.json()
    
    // 验证必需参数
    if (!text) {
      return new Response(
        JSON.stringify({ 
          error: '缺少翻译文本',
          code: 'MISSING_TEXT'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ 
          error: '缺少DeepL API密钥',
          code: 'MISSING_API_KEY'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // 验证文本长度（DeepL限制）
    if (text.length > 5000) {
      return new Response(
        JSON.stringify({ 
          error: '文本长度超过5000字符限制',
          code: 'TEXT_TOO_LONG'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`翻译请求: ${text.substring(0, 50)}...`)

    // 调用DeepL API
    const deeplResponse = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'DeepL-Proxy-Supabase/1.0'
      },
      body: new URLSearchParams({
        text: text,
        source_lang: source_lang,
        target_lang: target_lang
      })
    })

    // 处理DeepL API响应
    if (!deeplResponse.ok) {
      const errorData = await deeplResponse.json().catch(() => ({}))
      
      // 根据错误状态码提供更友好的错误信息
      let errorMessage = '翻译请求失败'
      let errorCode = 'DEEPL_ERROR'
      
      switch (deeplResponse.status) {
        case 400:
          errorMessage = '请求参数错误'
          errorCode = 'BAD_REQUEST'
          break
        case 403:
          errorMessage = 'API密钥无效或权限不足'
          errorCode = 'INVALID_API_KEY'
          break
        case 413:
          errorMessage = '翻译文本过长'
          errorCode = 'TEXT_TOO_LONG'
          break
        case 429:
          errorMessage = '请求过于频繁，请稍后重试'
          errorCode = 'RATE_LIMIT'
          break
        case 456:
          errorMessage = 'API配额已用完'
          errorCode = 'QUOTA_EXCEEDED'
          break
        case 503:
          errorMessage = 'DeepL服务暂时不可用'
          errorCode = 'SERVICE_UNAVAILABLE'
          break
        default:
          errorMessage = `DeepL API错误 (${deeplResponse.status}): ${errorData.message || deeplResponse.statusText}`
      }
      
      return new Response(
        JSON.stringify({
          error: errorMessage,
          code: errorCode,
          details: errorData
        }),
        { 
          status: deeplResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const data = await deeplResponse.json()
    
    // 验证返回数据格式
    if (!data.translations || !data.translations[0]) {
      return new Response(
        JSON.stringify({
          error: 'DeepL API返回数据格式错误',
          code: 'INVALID_RESPONSE_FORMAT'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`翻译成功: ${data.translations[0].text.substring(0, 50)}...`)

    // 返回翻译结果
    return new Response(
      JSON.stringify({
        success: true,
        translation: data.translations[0].text,
        detected_source_language: data.translations[0].detected_source_language,
        source_lang: source_lang,
        target_lang: target_lang
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Edge Function错误:', error)
    
    // 网络错误或其他系统错误
    return new Response(
      JSON.stringify({
        error: 'Edge Function内部错误',
        code: 'FUNCTION_ERROR',
        message: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 