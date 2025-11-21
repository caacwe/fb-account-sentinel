import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import axios from "axios";

interface CheckResult {
  live: string[];
  dead: string[];
}

const Index = () => {
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
      toast.error("请输入至少一个用户 ID");
      return;
    }

    const ids = inputValue
      .split("\n")
      .map((item) => item.trim())
      .filter((item) => item.length)
      .map((item) => extractId(item))
      .filter((item, index, self) => item && self.indexOf(item) === index) as string[];

    if (ids.length === 0) {
      toast.error("未找到有效的 14 位数字 ID");
      return;
    }

    setIsChecking(true);
    setResult({ live: [], dead: [] });
    setProgress(0);
    setStats({ processed: 0, total: ids.length });

    const newResult: CheckResult = { live: [], dead: [] };
    let processed = 0;

    toast.success(`开始检测 ${ids.length} 个账号`);

    for (const uid of ids) {
      const isLive = await checkLive(uid);
      if (isLive) {
        newResult.live.push(uid);
      } else {
        newResult.dead.push(uid);
      }
      processed++;
      setProgress((processed / ids.length) * 100);
      setStats({ processed, total: ids.length });
      setResult({ ...newResult });
    }

    setIsChecking(false);
    toast.success("检测完成");
  };

  const handleClear = () => {
    setInputValue("");
    setResult({ live: [], dead: [] });
    setProgress(0);
    setStats({ processed: 0, total: 0 });
    toast.success("已清除所有数据");
  };

  const copyToClipboard = (text: string, type: string) => {
    if (!text) {
      toast.error(`没有可复制的${type}账号`);
      return;
    }
    navigator.clipboard.writeText(text);
    toast.success(`${type}账号已复制`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground mb-1">
            Facebook 账号检测
          </h1>
          <p className="text-sm text-muted-foreground">
            批量验证账号状态，自动提取14位数字
          </p>
        </div>

        {/* Progress Section - Always visible */}
        {(isChecking || stats.total > 0) && (
          <Card className="p-4 mb-6 border-border">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-6">
                  <span className="text-muted-foreground">
                    进度: {stats.processed} / {stats.total}
                  </span>
                  <span className="text-success font-medium">
                    有效: {result.live.length}
                  </span>
                  <span className="text-destructive font-medium">
                    无效: {result.dead.length}
                  </span>
                </div>
                <span className="font-medium text-foreground">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </Card>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Input Section */}
          <Card className="p-5 border-border">
            <div className="mb-4">
              <h2 className="text-sm font-medium text-foreground mb-1">输入 ID</h2>
              <p className="text-xs text-muted-foreground">
                每行一个 ID，支持多种格式
              </p>
            </div>
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="100012345678901&#10;user_100012345678901&#10;https://facebook.com/100012345678901"
              className="min-h-[240px] font-mono text-xs resize-none mb-4 bg-muted/30"
            />
            <div className="flex gap-3">
              <Button
                onClick={handleCheck}
                disabled={isChecking}
                className="flex-1"
              >
                {isChecking ? "检测中..." : "开始检测"}
              </Button>
              <Button
                onClick={handleClear}
                variant="outline"
                disabled={isChecking}
                className="px-6"
              >
                清空
              </Button>
            </div>
          </Card>

          {/* Quick Stats */}
          <Card className="p-5 border-border bg-primary/5">
            <div className="mb-4">
              <h2 className="text-sm font-medium text-foreground mb-1">统计概览</h2>
              <p className="text-xs text-muted-foreground">实时检测数据</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-card rounded-md border border-border">
                <div className="text-2xl font-semibold text-success mb-1">
                  {result.live.length}
                </div>
                <div className="text-xs text-muted-foreground">有效账号</div>
              </div>
              <div className="p-4 bg-card rounded-md border border-border">
                <div className="text-2xl font-semibold text-destructive mb-1">
                  {result.dead.length}
                </div>
                <div className="text-xs text-muted-foreground">无效账号</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Results Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Live Results */}
          <Card className="border-border">
            <div className="p-4 border-b border-border bg-success/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-foreground">
                    有效账号
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    ({result.live.length})
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(result.live.join("\n"), "有效")}
                  className="h-7 text-xs"
                >
                  复制
                </Button>
              </div>
            </div>
            <Textarea
              value={result.live.join("\n")}
              readOnly
              placeholder="有效的用户 ID 将显示在这里..."
              className="min-h-[300px] font-mono text-xs resize-none border-0 rounded-t-none bg-muted/20"
            />
          </Card>

          {/* Dead Results */}
          <Card className="border-border">
            <div className="p-4 border-b border-border bg-destructive/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-foreground">
                    无效账号
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    ({result.dead.length})
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(result.dead.join("\n"), "无效")}
                  className="h-7 text-xs"
                >
                  复制
                </Button>
              </div>
            </div>
            <Textarea
              value={result.dead.join("\n")}
              readOnly
              placeholder="无效的用户 ID 将显示在这里..."
              className="min-h-[300px] font-mono text-xs resize-none border-0 rounded-t-none bg-muted/20"
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
