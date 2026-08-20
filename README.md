# ecolab-next

ISOL CODING LAB(이코랩)의 Next.js 작업 폴더입니다.

기존 HTML/CSS/JS 사이트는 **상위 폴더에 그대로** 있습니다. 이 폴더는 그 사이트를 하나씩 옮겨 오기 위한 새 프로젝트입니다.

## 실행

```bash
cd ecolab-next
npm run dev
```

브라우저에서 `http://localhost:3000` 을 엽니다.

- `npm run dev`: 내 컴퓨터에서 Next.js 사이트를 실행하는 명령입니다.
- `localhost`: 인터넷 공개 주소가 아니라, 이 컴퓨터에서만 보이는 주소입니다.

현재 옮겨 온 화면:

- Header / Footer
- 홈 (Hero, 검색, 필터, 프로그램 카드)
- 프로그램 상세 `/programs/exam-flow`
- 제작자 목록 `/makers`, 제작자 상세 `/makers/maker-001`
- 아이디어 `/ideas`
- Vibe Guide `/guide`

## Supabase

프로그램·제작자 데이터는 `.env.local`이 있으면 Supabase 표를 읽고, 키가 없으면 JSON 파일을 읽습니다.

1. `.env.local.example`을 복사해 `.env.local`을 만듭니다
2. Project URL과 anon/publishable 키를 넣습니다. 채팅·GitHub에는 넣지 마세요
3. `npm run dev`를 다시 실행합니다

아이디어는 Supabase 표를 읽고, 표가 없으면 JSON을 읽습니다. 가이드는 아직 JSON입니다.

오른쪽 위 **Google로 로그인** 뒤에는 가입 코드를 입력하거나, 메인 관리자가 가입을 승인해야 교직원이 됩니다.

교직원 SQL: `ecolab-next/supabase/staff-access.sql`

좋아요 SQL: `ecolab-next/supabase/likes.sql`

댓글 SQL: `ecolab-next/supabase/comments.sql`

후기 작성자 이름 SQL: `ecolab-next/supabase/comment-author-name.sql`

아이디어 SQL: `ecolab-next/supabase/ideas.sql`

아이디어 수정·삭제 SQL: `ecolab-next/supabase/ideas-manage.sql`

프로그램 등록 SQL: `ecolab-next/supabase/programs-manage.sql`

교직원 이름을 제작자 목록에 넣는 SQL: `ecolab-next/supabase/staff-maker.sql`

## 배포 (Vercel)

인터넷 주소로 선생님들이 접속하려면 Vercel에 올립니다. 이 폴더가 GitHub 저장소의 루트이므로 **Root Directory는 비워 둡니다.** `.env.local`은 올리지 말고, 같은 이름/값은 Vercel 환경 변수에만 넣습니다. 채팅·GitHub에는 키를 붙이지 마세요.

Google 로그인이 배포 주소에서도 되려면, 배포 후 나온 주소(`https://....vercel.app`)를 아래에도 추가합니다.

1. Supabase → Authentication → URL Configuration
   - Site URL: 배포 주소
   - Redirect URLs: `https://배포주소/auth/callback` 과 `http://localhost:3000/auth/callback`
2. Google Cloud → 기존 OAuth 클라이언트 → Authorized JavaScript origins에 배포 주소 추가
   - Redirect URI는 기존 Supabase 콜백 주소를 그대로 둡니다
