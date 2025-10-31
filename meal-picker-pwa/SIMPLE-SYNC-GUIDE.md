# ☁️ Cloud Sync - Simple Guide

> Your data syncs automatically. You only need to act when there's a conflict.

## 🎯 How It Works

### Without Login (Local Mode)
```
✅ App works normally
✅ Data saved on your device
❌ No cloud backup
❌ Can't access from other devices
```

### With Login (Cloud Sync Mode)
```
✅ App works normally
✅ Data saved on your device AND cloud
✅ Automatic sync every 5 minutes
✅ Sync when you come back online
✅ Access from any device
```

---

## 🔄 Automatic Sync (You Don't Need to Do Anything!)

Once you're logged in, sync happens automatically:

1. **When you login** → Immediate sync
2. **Every 5 minutes** → Background sync
3. **When network reconnects** → Auto-sync
4. **When you open the app** → Checks for updates

You'll see a small cloud icon (☁️) in the bottom-right that shows sync status:
- `☁️` Gray = Not logged in
- `☁️` Green = Synced successfully
- `🔄` Blue spinning = Syncing now
- `⚠️` Orange = Conflict detected

---

## ⚠️ When You Need to Act: Conflicts

### What is a Conflict?

A conflict happens when:
- You edit restaurant "麦当劳" on your phone to tier "夯"
- Someone edits "麦当劳" on your laptop to tier "顶级"
- Both devices were offline
- Both try to sync

### What Happens?

1. **Automatic Detection**: System detects the conflict
2. **UI Appears**: A comparison screen shows both versions
3. **You Choose**: Pick which version to keep
4. **Auto-Sync**: Your choice syncs to all devices

### What's NOT a Conflict?

These sync automatically (no action needed):
- ✅ Device A adds new restaurant → Device B gets it
- ✅ Device A has newer version → All devices get newest
- ✅ Only one device edited → Newest wins automatically

---

## 🧠 Smart Conflict Detection

The system is smart about conflicts:

### Scenario 1: Simple Addition (Not a Conflict)
```
Phone: Add "Starbucks"
Laptop: Add "McDonald's"
→ Both sync automatically ✅
→ Both devices see both restaurants ✅
```

### Scenario 2: Sequential Edits (Not a Conflict)
```
9:00 AM - Phone: Edit "麦当劳" tier to "夯"
9:05 AM - Phone syncs
10:00 AM - Laptop: Opens app, gets "夯" version
10:05 AM - Laptop: Edit tier to "顶级"
10:10 AM - Laptop syncs
→ Newest version (顶级) wins automatically ✅
→ Phone gets updated on next sync ✅
```

### Scenario 3: Simultaneous Edits (REAL Conflict)
```
9:00 AM - Phone offline: Edit "麦当劳" to "夯"
9:02 AM - Laptop offline: Edit "麦当劳" to "顶级"
9:05 AM - Phone online: Syncs "夯" version
9:06 AM - Laptop online: Tries to sync "顶级"
→ Conflict detected! ⚠️
→ UI appears asking you to choose
→ You pick one → All devices sync to your choice ✅
```

The key: **If both devices edit the same thing within 5 minutes while offline, it's a conflict.**

---

## 📱 Status Indicator Explained

Located in bottom-right corner of navigation bar:

### Gray Cloud Off Icon (☁️)
**Meaning**: Local mode, not logged in
**Action**: Your data is only on this device
**Tip**: Click "登录" in Management screen to enable sync

### Green Cloud Icon (☁️)
**Meaning**: Everything is synced!
**Action**: None needed, you're all set
**Details**: Hover to see last sync time

### Blue Spinning Icon (🔄)
**Meaning**: Syncing in progress
**Action**: None needed, just wait (usually 1-2 seconds)
**Note**: This happens automatically in background

### Orange Warning Icon (⚠️)
**Meaning**: Conflict detected
**Action**: Conflict resolver UI will pop up automatically
**Next**: Choose which version to keep

---

## 💡 Best Practices

### To Avoid Conflicts

1. **Let it sync**: Wait a moment when you switch devices
2. **Online editing**: Edit while online when possible
3. **Check status**: Glance at cloud icon to ensure sync happened
4. **Sequential work**: Finish edits on one device before switching

### If You Get a Conflict

1. **Don't panic**: Conflicts are rare and easy to resolve
2. **Read both versions**: The UI shows them side-by-side
3. **Pick the right one**: Choose which has the data you want
4. **Move on**: Once resolved, it's synced everywhere

---

## ❓ Common Questions

### Q: Do I need to manually sync?
**A:** No! It's automatic. Just use the app normally.

### Q: How often does it sync?
**A:** Every 5 minutes when logged in, plus when you open the app or reconnect to internet.

### Q: What if I'm offline?
**A:** App works normally offline. Data syncs when you're back online.

### Q: Can I force a sync?
**A:** No need! It's already automatic. If you're worried, just wait 5 minutes or restart the app.

### Q: Why did I get a conflict?
**A:** Two devices edited the same restaurant data while both offline. Rare, but the system catches it.

### Q: What happens if I ignore a conflict?
**A:** The conflict resolver UI will keep appearing until you resolve it. Best to resolve quickly.

### Q: Is my data safe?
**A:** Yes! Cloud backup + local storage = double protection.

---

## 🎉 Summary

**For 99% of usage:**
1. Login once → Forget about sync
2. Use app on any device → Data just works
3. Glance at green cloud icon → Peace of mind

**For the rare 1% (conflicts):**
1. Conflict UI appears automatically
2. Choose which version to keep
3. Done! All devices updated

**Bottom line:** You never think about syncing. It just works. ✨

---

## 🚀 Getting Started

1. **Open app** → Use normally (local mode)
2. **After adding 3+ restaurants** → Smart prompt: "Enable sync?"
3. **Click "启用同步"** → Login/register
4. **Done!** → Automatic sync begins
5. **Green cloud icon** → You're protected

That's it! From now on, sync is invisible and automatic. 🎉

---

**Need Help?**
- Check the cloud icon in bottom-right
- Green = you're good
- Orange = resolve the conflict shown
- Gray = login to enable sync
