# k6でアプリケーションのパフォーマンスをテストする

## アーキテクチャ

基本的な流れは、以下です。

1. パフォーマンステストのシナリオ(k6 script)がS3にアップロードされる
1. AWS CodePipelineがアップロードを検知して、AWS CodeBuildを起動する
1. AWS CodeBuildがk6を実行して、結果をS3にアップロードする

### 使用しているサービス

- AWS CodePipeline: テストシナリオのアップロードを検知して、AWS CodeBuildを起動するために使用
- AWS CodeBuild: 負荷テスト実行に使用
- AWS S3: テストシナリオと結果の保存に使用
- AWS CloudFormation: CDKで使用
- k6: 負荷テストのシナリオを実行するために使用
- DockerHub: k6のDockerイメージを取得するために使用

## 初期構築

### 前提条件

- AWSのアカウントを持っていること
- AWS CLIがインストールされて、設定が完了していること
- AWS CDKがインストールされていること

### 構築手順

#### リポジトリのクローン

```{bash}
git clone github.com/soneske/k6-performance-test
```

#### AWS CDKのデプロイ

`/attacker`ディレクトにして、下記コマンドを実行し、必要なAWSリソースをデプロイします。

```{bash}
npm install
cdk deploy --all
```

ただし、`/attacker/lib/attacker-stack.ts`の以下のを必要に応じて変更してください。

- `bucketName` : S3バケット名 (ここでは、`k6-attacker-source-bucket`と`k6-attacker-result-bucket`としています)
- `computeType` : テストシナリオを実行するに必要なリソースのタイプ (主にスペック不足を想定)

## テストシナリオの実行

`scenario`ディレクトリにテストシナリオを配置して、以下のコマンドでS3にアップロードします。

```{bash}
bash deploy.sh
```

テストが完了したら、下記コマンドで、テストシナリオの実行結果をダウンロードします。

```{bash}
aws s3 cp --recursive s3://k6-attacker-result-bucket .
```

## テストシナリオの作成

テストシナリオは、`scenario/scripts/test.js`に配置します。
初期では、`/app`ディレクトリに出力したものを、結果としてS3に出力するようになっています。

必要に応じて、`test.js`と`test.sh`を変更してください。

## 想定費用

S3のストレージ料金と、CodeBuildの実行料金が発生します。 S3はバージョニングしているので、その分だけストレージ料金がかかります。

- [S3の費用](https://aws.amazon.com/jp/s3/pricing/)
- [CodeBuildの費用](https://aws.amazon.com/jp/codebuild/pricing/)

## 参考

- [k6のドキュメント](https://k6.io/docs/)
- [How to Perform Load Testing with k6 using AWS CodeBuild Platform](https://k6.io/blog/integrating-k6-with-aws-codebuild/)

## TODO

- [ ] テストシナリオの実行結果を通知する
- [ ] テストシナリオの実行結果をグラフ化する
- [ ] k6 browser recorderを使ったテストシナリオの作成 (k6にアカウントしなければならないため終了)
- [ ] Playwrightを使った場合との比較