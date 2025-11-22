import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-smart-toast";
import { AlertTriangle } from "lucide-react";
import axios from "axios";

interface CheckResult {
  live: string[];
  dead: string[];
}

const Index = () => {
  const MAX_IDS = 10000; // 最大支持10000个ID
  const [inputValue, setInputValue] = useState("");
  const [result, setResult] = useState<CheckResult>({ live: [], dead: [] });
  const [isChecking, setIsChecking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({ processed: 0, total: 0 });

  const extractId = (text: string): string | null => {
    const matches = text.match(/\d+/g);
    if (!matches) return null;

    for (let match of matches) {
      if (match.length === 14) {
        return match;
      }
    }

    const longestDigits = matches.reduce((max, current) =>
      current.length > max.length ? current : max,
      ""
    );

    if (longestDigits.length >= 14) {
      return longestDigits.substring(0, 14);
    }

    return null;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const lines = value.split("\n").filter(line => line.trim());
    
    if (lines.length > MAX_IDS) {
      toast.error(`最多支持 ${MAX_IDS} 个 ID，已自动截断 ⚠️`);
      const truncated = lines.slice(0, MAX_IDS).join("\n");
      setInputValue(truncated);
      return;
    }
    
    setInputValue(value);
  };

  const checkLive = async (uid: string): Promise<boolean> => {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/${uid}/picture?type=normal`
      );
      return !response.request.responseURL.includes("static");
    } catch {
      return false;
    }
  };

  const handleCheck = async () => {
    if (!inputValue.trim()) {
      toast.error("请先输入要检测的账号哦 😊");
      return;
    }

    // 立即设置加载状态，避免延迟感
    setIsChecking(true);
    setResult({ live: [], dead: [] });
    setProgress(0);

    // 使用 setTimeout 让 UI 先更新
    setTimeout(async () => {
      const lines = inputValue
        .split("\n")
        .map((item) => item.trim())
        .filter((item) => item.length);

      // 提取 ID 并使用 Set 去重（性能更好）
      const idSet = new Set<string>();
      for (const line of lines) {
        const id = extractId(line);
        if (id) {
          idSet.add(id);
        }
      }

      const ids = Array.from(idSet);

      if (ids.length === 0) {
        setIsChecking(false);
        toast.error("没有找到有效的账号 ID，请检查格式后再试 🔍");
        return;
      }

      setStats({ processed: 0, total: ids.length });

      const newResult: CheckResult = { live: [], dead: [] };
      let processed = 0;

      toast.success(`正在为您检测 ${ids.length} 个账号，请稍候... ⏳`);

      // 100线程并发检测
      const concurrency = 10;
      for (let i = 0; i < ids.length; i += concurrency) {
        const batch = ids.slice(i, i + concurrency);
        const results = await Promise.all(
          batch.map(async (uid) => ({
            uid,
            isLive: await checkLive(uid),
          }))
        );

        results.forEach(({ uid, isLive }) => {
          if (isLive) {
            newResult.live.push(uid);
          } else {
            newResult.dead.push(uid);
          }
        });

        processed += batch.length;
        setProgress((processed / ids.length) * 100);
        setStats({ processed, total: ids.length });
        setResult({ ...newResult });
      }

      setIsChecking(false);
      toast.success(`检测完成！共找到 ${newResult.live.length} 个有效账号 ✅`);
    }, 0);
  };

  const handleClear = () => {
    setInputValue("");
    setResult({ live: [], dead: [] });
    setProgress(0);
    setStats({ processed: 0, total: 0 });
    toast.success("已清空，可以开始新的检测了 🆕");
  };

  const copyToClipboard = (text: string, type: string) => {
    if (!text) {
      toast.error(`暂时还没有${type}账号可以复制哦 📋`);
      return;
    }
    navigator.clipboard.writeText(text);
    toast.success(`已复制 ${text.split('\n').length} 个${type}账号 📋`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Facebook-style Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10 shadow-sm animate-fade-in">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center h-14">
            <h1 className="text-xl font-bold text-primary">
              Facebook 账号检测工具
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Description Card */}
        <Card className="mb-4 shadow-sm animate-slide-up hover-lift">
          <div className="p-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              在输入框内输入Facebook账号UID，每行一个UID，点击开始检测按钮就可以检测账号是否存活，部分账号被锁定也会检测为死，解锁后可恢复账号状态，检测供参考，具体请登录账号查看状态。
            </p>
          </div>
        </Card>

        {/* Compact Side Warning */}
        <div className="mb-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-950/20 border-l-4 border-l-primary rounded-r-lg shadow-sm">
            <AlertTriangle className="h-3.5 w-3.5 text-primary flex-shrink-0" />
            <p className="text-xs text-foreground">
              <span className="font-semibold">提示：</span>
              请开启代理访问以确保检测准确
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="mb-4">
          {/* Input Section */}
          <Card className="shadow-sm hover-lift animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="p-4 border-b border-border bg-muted/30">
              <h2 className="text-base font-semibold text-foreground mb-1">输入账号 ID</h2>
              <p className="text-xs text-muted-foreground">
                每行一个 ID，支持多种格式
              </p>
            </div>
            <div className="p-4">
              <Textarea
                value={inputValue}
                onChange={handleInputChange}
                placeholder="100012345678901&#10;user_100012345678901&#10;https://facebook.com/100012345678901"
                className="min-h-[140px] max-h-[200px] font-mono text-sm resize-none mb-4 border-border overflow-y-auto rounded-lg"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleCheck}
                  disabled={isChecking}
                  className="flex-1 font-semibold shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  size="lg"
                >
                  {isChecking ? "检测中..." : "开始检测"}
                </Button>
                <Button
                  onClick={handleClear}
                  variant="outline"
                  disabled={isChecking}
                  className="px-8 font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  size="lg"
                >
                  清空
                </Button>
              </div>
            </div>

            {/* Progress Section */}
            {(isChecking || stats.total > 0) && (
              <div className="px-4 pb-4 space-y-3 animate-scale-in">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-6">
                    <span className="text-muted-foreground font-medium transition-all duration-300">
                      进度: {stats.processed} / {stats.total}
                    </span>
                    <span className="text-success font-semibold transition-all duration-300">
                      有效: {result.live.length}
                    </span>
                    <span className="text-destructive font-semibold transition-all duration-300">
                      无效: {result.dead.length}
                    </span>
                  </div>
                  <span className="font-bold text-primary text-base transition-all duration-300">
                    {Math.round(progress)}%
                  </span>
                </div>
                <Progress value={progress} className="h-2.5 transition-all duration-300" />
              </div>
            )}
          </Card>
        </div>

        {/* Results Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Live Results */}
          <Card className="shadow-sm hover-lift animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="p-4 border-b border-border bg-green-50 dark:bg-green-950/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-foreground">
                    有效账号
                  </h3>
                  <span className="px-2 py-0.5 bg-success text-success-foreground rounded-full text-xs font-semibold transition-all duration-300">
                    {result.live.length}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(result.live.join("\n"), "有效")}
                  className="h-8 text-xs font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  复制全部
                </Button>
              </div>
            </div>
            <Textarea
              value={result.live.join("\n")}
              readOnly
              placeholder="有效的用户 ID 将显示在这里..."
              className="min-h-[320px] font-mono text-sm resize-none border-0 rounded-t-none bg-card transition-all duration-200"
            />
          </Card>

          {/* Dead Results */}
          <Card className="shadow-sm hover-lift animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="p-4 border-b border-border bg-red-50 dark:bg-red-950/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-foreground">
                    无效账号
                  </h3>
                  <span className="px-2 py-0.5 bg-destructive text-destructive-foreground rounded-full text-xs font-semibold transition-all duration-300">
                    {result.dead.length}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(result.dead.join("\n"), "无效")}
                  className="h-8 text-xs font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  复制全部
                </Button>
              </div>
            </div>
            <Textarea
              value={result.dead.join("\n")}
              readOnly
              placeholder="无效的用户 ID 将显示在这里..."
              className="min-h-[320px] font-mono text-sm resize-none border-0 rounded-t-none bg-card transition-all duration-200"
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
