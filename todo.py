import sys
import json

class TodoApp:
    def __init__(self, tasks_file="tasks.json"):
        self.tasks_file = tasks_file
        self.tasks = self.load_tasks()

    def load_tasks(self):
        """從 JSON 檔案載入任務"""
        try:
            with open(self.tasks_file, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            return []

    def save_tasks(self):
        """將任務儲存到 JSON 檔案"""
        with open(self.tasks_file, 'w') as f:
            json.dump(self.tasks, f, indent=4)

    def add_task(self, task_content):
        """新增一個任務"""
        self.tasks.append({"content": task_content, "done": False})
        self.save_tasks()
        print(f"新增任務: {task_content}")

    def list_tasks(self):
        """列出所有未完成的任務"""
        print("待辦事項:")
        found = False
        for i, task in enumerate(self.tasks):
            if not task["done"]:
                print(f"{i + 1}. {task['content']}")
                found = True
        if not found:
            print("沒有待辦事項。")

    def mark_task_done(self, task_number):
        """將指定任務標記為已完成"""
        try:
            task_index = int(task_number) - 1
            if 0 <= task_index < len(self.tasks):
                if not self.tasks[task_index]["done"]:
                    self.tasks[task_index]["done"] = True
                    self.save_tasks()
                    print(f"任務 '{self.tasks[task_index]['content']}' 已標記為完成。")
                else:
                    print("錯誤：此任務已經是完成狀態。")
            else:
                print("錯誤：無效的任務編號。")
        except ValueError:
            print("錯誤：請輸入有效的任務編號。")

def show_help():
    """顯示使用說明"""
    print("使用方法:")
    print("  python todo.py list              - 列出所有待辦事項")
    print("  python todo.py add <任務內容>   - 新增一個待辦事項")
    print("  python todo.py done <任務編號>    - 將指定任務標記為已完成")
    print("  python todo.py help              - 顯示此說明")

def main():
    app = TodoApp()
    if len(sys.argv) > 1:
        command = sys.argv[1]
        if command == "add" and len(sys.argv) > 2:
            app.add_task(" ".join(sys.argv[2:]))
        elif command == "list":
            app.list_tasks()
        elif command == "done" and len(sys.argv) > 2:
            app.mark_task_done(sys.argv[2])
        elif command == "help":
            show_help()
        else:
            print("無效的指令。請使用 'python todo.py help' 查看說明。")
    else:
        app.list_tasks()

if __name__ == "__main__":
    main()
