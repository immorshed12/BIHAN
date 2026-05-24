package com.pdfsite.smslistener

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Telephony
import android.util.Log
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import org.json.JSONObject
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL

class SmsBroadcastReceiver : BroadcastReceiver() {

    companion object {
        private const val TAG = "SmsBroadcastReceiver"
        
        // Target webhook endpoint on your Next.js serverless architecture
        const val BACKEND_WEBHOOK_URL = "http://localhost:3000/api/payments/webhook"
        const val WEBHOOK_SECRET = "fallback_demo_secret"
    }

    override fun onReceive(context: Context?, intent: Intent?) {
        if (intent == null || intent.action != Telephony.Sms.Intents.SMS_RECEIVED_ACTION) return

        try {
            // Retrieve SMS messages from Intent parameters
            val messages = Telephony.Sms.Intents.getMessagesFromIntent(intent)
            for (message in messages) {
                val rawSender = message.originatingAddress ?: continue
                val sender = rawSender.uppercase().trim()
                val body = message.messageBody ?: continue

                Log.d(TAG, "Incoming SMS from: $rawSender")

                // Case-Insensitive verification of target mobile wallet notifications
                if (sender.contains("BKASH") || sender.contains("NAGAD") || sender.contains("16247") || sender.contains("16167")) {
                    Log.d(TAG, "Reconciling P2P Payment SMS Body text content...")
                    
                    // Asynchronously post payload to our Next.js backend webhook endpoint
                    CoroutineScope(Dispatchers.IO).launch {
                        dispatchSMSWebhook(rawSender, body)
                    }
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to handle incoming SMS: ${e.message}")
        }
    }

    private fun dispatchSMSWebhook(sender: String, messageBody: String) {
        try {
            val url = URL(BACKEND_WEBHOOK_URL)
            val connection = url.openConnection() as HttpURLConnection
            connection.requestMethod = "POST"
            connection.setRequestProperty("Content-Type", "application/json")
            connection.setRequestProperty("Authorization", "Bearer $WEBHOOK_SECRET")
            connection.doOutput = true

            val payload = JSONObject().apply {
                put("sender", sender)
                put("message", messageBody)
            }

            val writer = OutputStreamWriter(connection.outputStream)
            writer.write(payload.toString())
            writer.flush()
            writer.close()

            val responseCode = connection.responseCode
            val responseMsg = connection.responseMessage
            Log.d(TAG, "Server Handshake status code: $responseCode | Msg: $responseMsg")
            
            connection.disconnect()
        } catch (e: Exception) {
            Log.e(TAG, "Failed to dispatch transaction payload to backend: ${e.message}")
        }
    }
}
