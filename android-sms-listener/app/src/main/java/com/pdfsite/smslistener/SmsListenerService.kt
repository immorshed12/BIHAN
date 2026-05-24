package com.pdfsite.smslistener

import android.app.*
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat
import kotlinx.coroutines.*
import org.json.JSONObject
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL

class SmsListenerService : Service() {

    private val serviceJob = SupervisorJob()
    private val serviceScope = CoroutineScope(Dispatchers.IO + serviceJob)
    private var pingJob: Job? = null

    companion object {
        private const val TAG = "SmsListenerService"
        private const val CHANNEL_ID = "SMS_GATEWAY_CHANNEL"
        private const val NOTIFICATION_ID = 101
        
        // Replace with your live Vercel production deployment URL
        const val BACKEND_PING_URL = "http://localhost:3000/api/gateway/ping"
        const val DEVICE_ID = "android_transceiver_node_01"
        const val APP_VERSION = "1.0.0"
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        startForeground(NOTIFICATION_ID, buildForegroundNotification())
        startHeartbeatCycle()
        Log.d(TAG, "Foreground SMS listener service initialized successfully.")
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // Enforce sticky behavior to let service reboot immediately if killed by OS memory trims
        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    private fun startHeartbeatCycle() {
        pingJob = serviceScope.launch {
            while (isActive) {
                sendHeartbeatPing()
                delay(5 * 60 * 1000) // Sleep/Delay for exactly 5 minutes
            }
        }
    }

    private fun sendHeartbeatPing() {
        try {
            val url = URL(BACKEND_PING_URL)
            val connection = url.openConnection() as HttpURLConnection
            connection.requestMethod = "POST"
            connection.setRequestProperty("Content-Type", "application/json")
            connection.doOutput = true

            val payload = JSONObject().apply {
                put("deviceId", DEVICE_ID)
                put("appVersion", APP_VERSION)
                put("status", "online")
            }

            val writer = OutputStreamWriter(connection.outputStream)
            writer.write(payload.toString())
            writer.flush()
            writer.close()

            val responseCode = connection.responseCode
            Log.d(TAG, "Gateway Ping status response code: $responseCode")
            connection.disconnect()
        } catch (e: Exception) {
            Log.e(TAG, "Failed to dispatch system heartbeat ping payload: ${e.message}")
        }
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES,O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "P2P Gateway Service Channel",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Keeps the local Android P2P transaction receiver active in background space."
            }
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }

    private fun buildForegroundNotification(): Notification {
        val stopSelfIntent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, stopSelfIntent,
            PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("SMS Gateway Active")
            .setContentText("Listening for incoming bKash & Nagad payments...")
            .setSmallIcon(android.R.drawable.stat_notify_sync)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setCategory(Notification.CATEGORY_SERVICE)
            .build()
    }

    override fun onDestroy() {
        super.onDestroy()
        pingJob?.cancel()
        serviceJob.cancel()
        Log.d(TAG, "SmsListenerService completely shutdown.")
    }
}
