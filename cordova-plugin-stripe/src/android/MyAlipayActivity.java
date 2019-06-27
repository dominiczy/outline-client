package com.zyramedia.cordova.stripe;

import android.app.Activity;
import android.os.Bundle;
import android.content.Intent;

import android.os.Message;
import android.os.Looper;
import android.os.Handler;
import android.text.TextUtils;

import android.widget.Toast;

import com.stripe.android.Stripe;
import com.stripe.android.model.Source;
import com.stripe.android.model.SourceParams;

import java.lang.Thread;
import java.lang.Runnable;
import java.util.Map;

import com.alipay.sdk.app.PayTask;

import com.stripe.android.model.Source;
import com.stripe.android.exception.StripeException;

import android.util.Log;


public class MyAlipayActivity extends Activity {
	private static final int SDK_PAY_FLAG = 1;
	private Stripe stripeInstance;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        Log.d("Stripe", "onCreate");

        super.onCreate(savedInstanceState);
        String package_name = getApplication().getPackageName();
        setContentView(getApplication().getResources().getIdentifier("activity_new", "layout", package_name));


        Intent intent = getIntent();
        Log.d("Stripe", "getExtras");
        long amount = intent.getLongExtra("amount", 100L);
        String currency = intent.getStringExtra("currency");
        String name = intent.getStringExtra("name");
        String email = intent.getStringExtra("email");
        String returnURL = intent.getStringExtra("returnURL");

        Log.d("Stripe", "createSource");
        try {
            SourceParams sourceParams = SourceParams.createAlipaySingleUseParams(amount, currency, name, email, returnURL);
            Source source = stripeInstance.createSourceSynchronous(sourceParams, "pk_test_TYooMQauvdEDq54NiTphI7jx");
            Log.d("Stripe", "Got Source");
            invokeAlipayNative(source);
        } catch (StripeException e) {
            Log.e("Stripe", "StripeException");
        }
    }

    private Handler mHandler = new Handler(Looper.getMainLooper()) {
	  @Override
	  public void handleMessage(Message msg) {

	    Log.d("Stripe", "handleMessage");

	    switch (msg.what) {
	      case SDK_PAY_FLAG:
	        @SuppressWarnings("unchecked")
	        Map<String, String> answer = (Map<String, String>) msg.obj;
	        // The result info contains other information about the transaction
	        String resultInfo = answer.get("result");
	        String resultStatus = answer.get("resultStatus");
	        if (TextUtils.equals(resultStatus, "9000")) {
	            Toast.makeText(MyAlipayActivity.this, "success", Toast.LENGTH_SHORT).show();
	        } else {
	            Toast.makeText(MyAlipayActivity.this, "failed", Toast.LENGTH_SHORT).show();
	        }
	        break;
	      default:
	        break;
	    };
	  };
	};

	private void invokeAlipayNative(Source source) {

      Log.d("Stripe", "invokeAlipayNative");

      Map<String, Object> alipayParams = source.getSourceTypeData();
      final String dataString = (String) alipayParams.get("data_string");

      Runnable payRunnable = new Runnable() {
        @Override
        public void run() {
          // The PayTask class is from the Alipay SDK. Do not run this function
          // on the main thread.
          PayTask alipay = new PayTask(MyAlipayActivity.this);
          // Invoking this function immediately takes the user to the Alipay
          // app, if in stalled. If not, the user is sent to the browser.
          Map<String, String> result = alipay.payV2(dataString, true);

          // Once you get the result, communicate it back to the main thread
          Message msg = new Message();
          msg.what = SDK_PAY_FLAG;
          msg.obj = result;
          mHandler.sendMessage(msg);
        };
      };

      Thread payThread = new Thread(payRunnable);
      payThread.start();
    }
}