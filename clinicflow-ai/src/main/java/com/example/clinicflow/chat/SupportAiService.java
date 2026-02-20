package com.example.clinicflow.chat;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class SupportAiService {

    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    public ChatResponse reply(String message) {
        String normalized = message == null ? "" : message.trim().toLowerCase();

        if (containsAny(normalized, "料金", "price", "cost", "プラン")) {
            return new ChatResponse(
                    "料金のお問い合わせですね。現在は Starter / Standard / Enterprise の3プランがあります。必要なら用途を教えてください。",
                    "pricing",
                    List.of("プラン比較を知りたい", "見積もりが欲しい", "無料トライアルについて")
            );
        }

        if (containsAny(normalized, "エラー", "不具合", "bug", "動かない", "ログインできない")) {
            return new ChatResponse(
                    "不具合の可能性があります。発生した画面、操作手順、表示されたエラーメッセージを教えてください。優先度を付けて案内します。",
                    "troubleshooting",
                    List.of("ログインできない", "画面が真っ白", "500エラーが出る")
            );
        }

        if (containsAny(normalized, "導入", "開始", "setup", "はじめ方", "初期設定")) {
            return new ChatResponse(
                    "導入サポートですね。最短手順は「アカウント作成 → 初期設定 → テスト運用」です。どこから進めますか？",
                    "onboarding",
                    List.of("初期設定の手順", "必要な準備", "運用開始のチェックリスト")
            );
        }

        String timestamp = LocalDateTime.now().format(TIME_FORMAT);
        return new ChatResponse(
                "お問い合わせありがとうございます。内容を確認しました（" + timestamp + "）。担当サポートに接続する前に、目的をもう少し詳しく教えてください。",
                "general",
                List.of("料金について", "不具合について", "導入について")
        );
    }

    private boolean containsAny(String text, String... keywords) {
        for (String keyword : keywords) {
            if (text.contains(keyword.toLowerCase())) {
                return true;
            }
        }
        return false;
    }
}