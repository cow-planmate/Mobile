package com.planmate.planmate

import android.view.WindowManager
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

/**
 * 매니페스트의 windowSoftInputMode="adjustResize"는 액티비티 전체에 걸리는 값이라
 * 특정 화면 하나만 다르게 두려면 포커스에 있는 동안만 이 값을 바꿔야 한다.
 * react-native-screens의 네이티브 스크린 컨테이너는 이 값에 따라 리사이즈되므로,
 * JS 레이아웃만으로는 특정 화면의 리사이즈를 막을 수 없다.
 */
class SoftInputModeModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

  override fun getName() = "SoftInputMode"

  /**
   * setSoftInputMode는 내부적으로 requestLayout을 건드려 UI 스레드에서만 호출할 수
   * 있다. React Native 네이티브 모듈 메서드는 기본적으로 UI 스레드가 아니라서
   * runOnUiThread로 감싸지 않으면 "Only the original thread..." 예외가 난다.
   */
  @ReactMethod
  fun setAdjustNothing() {
    reactApplicationContext.currentActivity?.runOnUiThread {
      reactApplicationContext.currentActivity?.window
          ?.setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_NOTHING)
    }
  }

  @ReactMethod
  fun setAdjustResize() {
    reactApplicationContext.currentActivity?.runOnUiThread {
      reactApplicationContext.currentActivity?.window
          ?.setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE)
    }
  }
}
