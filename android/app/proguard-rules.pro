-keep class com.planmate.planmate.** { *; }

-keepclassmembers class * {
    @com.facebook.react.bridge.ReactMethod <methods>;
}
-keep @com.facebook.react.module.annotations.ReactModule class * { *; }

-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }

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

-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn javax.annotation.**
-dontwarn org.conscrypt.**
-dontwarn org.bouncycastle.**
-dontwarn org.openjsse.**

-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
}
