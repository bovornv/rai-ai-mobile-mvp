#!/bin/bash
# Monitor EAS Build progress - updates every 2 minutes

echo "🚀 Starting build monitor..."
echo "Will check build status every 2 minutes"

# Start the build in background and capture build ID
BUILD_OUTPUT=$(npx eas-cli build --platform android --profile preview --non-interactive 2>&1 | tee /tmp/eas-build.log)

# Extract build ID from output (look for build URL)
BUILD_ID=$(echo "$BUILD_OUTPUT" | grep -oP 'builds/[a-z0-9-]+' | head -1 | cut -d/ -f2)

if [ -z "$BUILD_ID" ]; then
    echo "❌ Could not start build or extract build ID"
    echo "Build output:"
    cat /tmp/eas-build.log
    exit 1
fi

echo "✅ Build started! Build ID: $BUILD_ID"
echo "📊 Monitoring build progress..."

# Monitor build status every 2 minutes
while true; do
    STATUS=$(npx eas-cli build:view $BUILD_ID --json 2>/dev/null | grep -oP '"status":\s*"\K[^"]+' || echo "unknown")
    
    clear
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📱 Rai AI Mobile - Build Monitor"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Build ID: $BUILD_ID"
    echo "Status: $STATUS"
    echo "Time: $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""
    
    case $STATUS in
        "finished")
            echo "✅ Build completed!"
            npx eas-cli build:view $BUILD_ID | grep -E "(Application Archive URL|Build Artifacts URL)" || true
            echo ""
            echo "📥 Download your APK from the link above"
            break
            ;;
        "errored"|"canceled")
            echo "❌ Build failed or was canceled"
            npx eas-cli build:view $BUILD_ID | tail -20
            break
            ;;
        "in-progress"|"in_queue"|"pending")
            echo "⏳ Build in progress... (checking again in 2 minutes)"
            ;;
        *)
            echo "⏳ Waiting for build to start... (checking again in 2 minutes)"
            ;;
    esac
    
    echo ""
    echo "Next check in 2 minutes..."
    sleep 120
done

