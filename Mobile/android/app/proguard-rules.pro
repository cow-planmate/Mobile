# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# ────────────────────────────────────────────────
# React Native
#
# RN·대부분의 서드파티 AAR은 자체 consumer 규칙을 포함하므로 여기서 다시 적지
# 않는다. 아래는 그 규칙만으로 부족한 것들이다.
# ────────────────────────────────────────────────

# 네이티브 모듈은 리플렉션으로 연결된다. 클래스명이 바뀌면 브리지가 찾지 못한다.
-keep class com.planmate.planmate.** { *; }

# JS에서 호출되는 네이티브 메서드
-keepclassmembers class * {
    @com.facebook.react.bridge.ReactMethod <methods>;
}
-keep @com.facebook.react.module.annotations.ReactModule class * { *; }

# Hermes
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }

# ────────────────────────────────────────────────
# Glide (react-native-fast-image)
#
# fast-image는 consumer 규칙을 배포하지 않는다. Glide는 애노테이션 프로세서가
# 만들어 낸 GeneratedAppGlideModule을 런타임에 리플렉션으로 찾으므로 지워지면
# 이미지가 통째로 로드되지 않는다.
# ────────────────────────────────────────────────
-keep public class * implements com.bumptech.glide.module.GlideModule
-keep class * extends com.bumptech.glide.module.AppGlideModule {
    <init>(...);
}
-keep public enum com.bumptech.glide.load.ImageHeaderParser$** {
    **[] $VALUES;
    public *;
}
-keep class com.bumptech.glide.load.data.ParcelFileDescriptorRewinder$InternalRewinder {
    *** rewind();
}
-keep class dev.rnfastimage.** { *; }
-keep class com.dylanvann.fastimage.** { *; }

# ────────────────────────────────────────────────
# OkHttp / Okio (RN 네트워킹 · Glide 통합)
# ────────────────────────────────────────────────
-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn javax.annotation.**
-dontwarn org.conscrypt.**
-dontwarn org.bouncycastle.**
-dontwarn org.openjsse.**

# ────────────────────────────────────────────────
# 기타
# ────────────────────────────────────────────────
# 릴리스 로그 제거 (JS 로그는 __DEV__ 가드로 이미 걸러진다)
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
}
