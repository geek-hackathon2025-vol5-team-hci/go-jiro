document.getElementById('fetchButton').addEventListener('click', () => {
    const messageElement = document.getElementById('message');
    messageElement.textContent = '取得中...';

    // Nginxのリバースプロキシを経由してバックエンドAPIを呼び出す
    fetch('/api/message')
        .then(response => response.json())
        .then(data => {
            messageElement.textContent = data.message;
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            messageElement.textContent = 'エラーが発生しました。';
        });
});