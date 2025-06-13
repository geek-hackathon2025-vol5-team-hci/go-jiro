document.addEventListener('DOMContentLoaded', () => {
    const authArea = document.getElementById('auth-area');
    const messageElement = document.getElementById('message');
    const fetchButton = document.getElementById('fetchButton');

    // ページ読み込み時にログイン状態を確認
    fetch('/api/profile')
        .then(response => {
            if (!response.ok) {
                // 401 Unauthorizedなどの場合は未ログインと判断
                throw new Error('Not authenticated');
            }
            return response.json();
        })
        .then(data => {
            if (data.user) {
                // ログインしている場合
                displayUserInfo(data.user);
            } else {
                // 未ログインの場合
                displayLoginButton();
            }
        })
        .catch(() => {
            // エラーが発生した場合（=未ログイン）
            displayLoginButton();
        });

    // ログインボタンを表示
    function displayLoginButton() {
        authArea.innerHTML = '<a href="/api/auth/google"><button>Googleでログイン</button></a>';
    }

    // ユーザー情報とログアウトボタンを表示
    function displayUserInfo(user) {
        authArea.innerHTML = `
            <p>ようこそ, ${user.displayName} さん</p>
            <p>Email: ${user.emails[0].value}</p>
            <img src="${user.photos[0].value}" alt="プロフィール画像" width="50">
            <br>
            <a href="/api/logout"><button>ログアウト</button></a>
        `;
    }

    // 元々のメッセージ取得ボタンの機能
    fetchButton.addEventListener('click', () => {
        messageElement.textContent = '取得中...';
        fetch('/api/message')
            .then(response => response.json())
            .then(data => {
                messageElement.textContent = data.message;
            })
            .catch(error => {
                console.error('Error fetching public data:', error);
                messageElement.textContent = 'エラーが発生しました。';
            });
    });
});