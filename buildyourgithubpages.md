在 GitHub 上建立個人網站，主要透過 GitHub Pages 這項服務，它可以讓你直接從 GitHub 儲存庫託管網站。以下是詳細步驟：

**1. 建立 GitHub 帳號**

* 如果還沒有 GitHub 帳號，請先到 GitHub 官網註冊一個。

**2. 建立儲存庫（Repository）**

* 登入 GitHub 後，點擊右上角的「+」按鈕，選擇「New repository」。
* 儲存庫名稱：
    * 如果你的網站是個人使用者頁面，儲存庫名稱必須是 `你的GitHub使用者名稱.github.io`。
    * 如果你的網站是專案頁面，儲存庫名稱可以自訂。
* 設定為「Public」（公開）。
* 可以選擇是否初始化一個 README 檔案。
* 點擊「Create repository」。

**3. 準備網站檔案**

* 將你的網站檔案（HTML、CSS、JavaScript、圖片等）準備好。
* 確保你的網站有一個 `index.html` 檔案，這是網站的首頁。

**4. 上傳網站檔案到 GitHub 儲存庫**

* 有多種方式可以上傳檔案：
    * **透過網頁介面：**
        * 在你的儲存庫頁面，點擊「Upload files」。
        * 將你的網站檔案拖放到頁面中，或點擊「choose your files」選擇檔案。
        * 在「Commit changes」區域，填寫提交訊息，然後點擊「Commit changes」。
    * **使用 Git 指令：**
        * 如果你熟悉 Git，可以使用 Git 指令將檔案推送到 GitHub 儲存庫。
        * 這需要你在電腦上安裝 Git。

**5. 啟用 GitHub Pages**

* 在你的儲存庫頁面，點擊「Settings」。
* 向下捲動到「Pages」部分。
* 在「Source」下拉選單中，選擇你要用來託管網站的分支（通常是 `main` 或 `master`）。
* 選擇儲存路徑，通常是根目錄。
* 點擊「Save」。
* GitHub 會自動開始建置你的網站。
* 稍等片刻，你的網站就會發布。你可以在「GitHub Pages」部分看到你的網站網址。

**6. 瀏覽你的網站**

* 使用 GitHub Pages 提供的網址，就可以在瀏覽器中看到你的個人網站了。

**重要注意事項：**

* GitHub Pages 適合託管靜態網站（HTML、CSS、JavaScript）。
* 如果需要後端功能（例如 PHP、Python），則需要使用其他託管服務。
* 如果你的儲存庫名稱命名為你的使用者名稱.github.io，那麼此儲存庫發布的網站，會是你的個人使用者頁面，每個GitHub帳號，僅能有一個個人使用者頁面。
* 如果你的儲存庫名稱不是你的使用者名稱.github.io，那麼此儲存庫發布的網站，會是你的專案頁面。

**額外資源：**

* GitHub Pages 官方文件：[https://pages.github.com/](https://pages.github.com/)
* 網路上有許多教學影片與文章，可以搜尋「GitHub Pages 教學」來獲得更詳細的資訊。

希望這些資訊對你有所幫助！
