import os
import re

files_to_update = [
    "C:/coding/ignite/frontend/src/app/admin/dashboard/page.tsx",
    "C:/coding/ignite/frontend/src/app/priest/dashboard/page.tsx",
    "C:/coding/ignite/frontend/src/app/quizzes/page.tsx",
    "C:/coding/ignite/frontend/src/components/InstallPrompt.tsx"
]

for file_path in files_to_update:
    if not os.path.exists(file_path):
        continue
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Add toast import if missing
    if "import { toast }" not in content and "alert(" in content:
        import_stmt = "import { toast } from 'sonner';\n"
        if "use client" in content:
            content = re.sub(r'("use client"|' + "'use client'" + r');?\n', r'\1;\n' + import_stmt, content)
        else:
            content = import_stmt + content
            
    # Replace success alerts
    content = content.replace('alert("Custom quiz created!");', 'toast.success("Custom quiz created!");')
    content = content.replace('alert("Points granted!");', 'toast.success("Points granted!");')
    content = content.replace("alert(`User is now ${res.isBanned ? 'banned' : 'unbanned'}.`);", "toast.success(`User is now ${res.isBanned ? 'banned' : 'unbanned'}.`);")
    content = content.replace("alert(`Season ended! Champions: ${res.topUsers?.map((u: any) => u.firstName).join(\", \") || \"None\"}`);", "toast.success(`Season ended! Champions: ${res.topUsers?.map((u: any) => u.firstName).join(\", \") || \"None\"}`);")
    
    # Replace error/generic alerts
    content = content.replace('alert("Failed to create custom quiz");', 'toast.error("Failed to create custom quiz");')
    content = content.replace('alert(res.error);', 'toast.error(res.error || "An error occurred");')
    content = content.replace('alert(res.error || "Failed to download data.");', 'toast.error(res.error || "Failed to download data.");')
    
    # Quizzes coming soon
    content = content.replace("alert(`Joining ${room.type} rooms is coming soon!`);", "toast.info(`Joining ${room.type} rooms is coming soon!`);")
    
    # Install prompt
    content = content.replace("alert('To install the app and remove the browser header, tap the Share icon at the bottom of your screen and select \"Add to Home Screen\".');", "toast.info('To install the app and remove the browser header, tap the Share icon at the bottom of your screen and select \"Add to Home Screen\".');")

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Alerts replaced.")
