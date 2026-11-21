# JS Playground 30

HTML, CSS, JavaScript와 여러 브라우저용 라이브러리를 조합한 30개 기능 데모 사이트입니다.

## 실행

`index.html`을 직접 열어도 대부분 동작하지만, 지도·오디오·클립보드 등 브라우저 보안 정책의 영향을 받는 기능은 로컬 서버 실행을 권장합니다.

```powershell
python -m http.server 4173
```

그 후 `http://localhost:4173/codex%EC%83%9D%EC%84%B1/`을 엽니다.

## 파일

- `index.html`: 30개 데모의 구조와 CDN 라이브러리 연결
- `styles.css`: 반응형 레이아웃, 다크/라이트 테마, 컴포넌트 스타일
- `app.js`: 각 데모의 실제 동작

외부 라이브러리는 CDN으로 불러오므로 전체 기능 사용에는 인터넷 연결이 필요합니다.
