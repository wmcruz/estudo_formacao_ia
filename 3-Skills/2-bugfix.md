Corrija o seguinte bug:

Ao utilizar o curl:
curl 'http://localhost:4200/api/posts/1' \
  -H 'Accept: application/json, text/plain, */*' \
  -H 'Accept-Language: pt-BR,pt;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6' \
  -H 'Connection: keep-alive' \
  -H 'DNT: 1' \
  -H 'Referer: http://localhost:4200/' \
  -H 'Sec-Fetch-Dest: empty' \
  -H 'Sec-Fetch-Mode: cors' \
  -H 'Sec-Fetch-Site: same-origin' \
  -H 'User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0' \
  -H 'sec-ch-ua: "Not;A=Brand";v="8", "Chromium";v="150", "Microsoft Edge";v="150"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "Linux"'

Recebo uma pagina em HTML e o front me retorna uma mensagem de 'post not found'

Response:
<!DOCTYPE html>
<html lang="en">
    <head>
        <script type="module" src="/@vite/client"></script>
        <meta charset="utf-8">
        <title>FrontEnd</title>
        <base href="/">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="icon" type="image/x-icon" href="favicon.ico">
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&amp;display=swap" rel="stylesheet">
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
        <link rel="stylesheet" href="styles.css">
        <style ng-app-id="ng">
            .dashboard[_ngcontent-ng-c2859620351] {
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                overflow: hidden;
                padding: 2rem 1rem;
                background: #0a0a1a;
            }

            .dashboard__background[_ngcontent-ng-c2859620351] {
                position: fixed;
                inset: 0;
                z-index: 0;
                overflow: hidden;
                pointer-events: none;
            }

            .orb[_ngcontent-ng-c2859620351] {
                position: absolute;
                border-radius: 50%;
                filter: blur(80px);
                opacity: 0.35;
                animation: _ngcontent-ng-c2859620351_drift 12s ease-in-out infinite alternate;
            }

            .orb--1[_ngcontent-ng-c2859620351] {
                width: 500px;
                height: 500px;
                background: radial-gradient( circle, #6366f1, transparent 70%);
                top: -150px;
                left: -150px;
                animation-duration: 14s;
            }

            .orb--2[_ngcontent-ng-c2859620351] {
                width: 400px;
                height: 400px;
                background: radial-gradient( circle, #a855f7, transparent 70%);
                bottom: -100px;
                right: -100px;
                animation-duration: 10s;
                animation-direction: alternate-reverse;
            }

            .orb--3[_ngcontent-ng-c2859620351] {
                width: 300px;
                height: 300px;
                background: radial-gradient( circle, #ec4899, transparent 70%);
                top: 50%;
                left: 60%;
                animation-duration: 16s;
            }

            @keyframes _ngcontent-ng-c2859620351_drift {
                from {
                    transform: translate(0, 0) scale(1);
                }

                to {
                    transform: translate(40px, 30px) scale(1.05);
                }
            }

            .dashboard__content[_ngcontent-ng-c2859620351] {
                position: relative;
                z-index: 1;
                width: 100%;
                max-width: 960px;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 2.5rem;
            }

            .dashboard__header[_ngcontent-ng-c2859620351] {
                text-align: center;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 10px;
            }

            .dashboard__logo[_ngcontent-ng-c2859620351] {
                width: 64px;
                height: 64px;
                border-radius: 16px;
                background: linear-gradient( 135deg, #6366f1, #a855f7);
                display: flex;
                align-items: center;
                justify-content: center;
                color: #ffffff;
                box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
                margin-bottom: 6px;
            }

            .dashboard__title[_ngcontent-ng-c2859620351] {
                font-size: clamp(2rem, 5vw, 3rem);
                font-weight: 800;
                margin: 0;
                background: linear-gradient( 135deg, #ffffff 0%, #c4b5fd 50%, #a855f7 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                letter-spacing: -0.03em;
                line-height: 1.1;
            }

            .dashboard__subtitle[_ngcontent-ng-c2859620351] {
                font-size: 1rem;
                color: rgba(255, 255, 255, 0.5);
                margin: 0;
            }

            .dashboard__search[_ngcontent-ng-c2859620351] {
                width: 100%;
            }

            .dashboard__loading[_ngcontent-ng-c2859620351] {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 14px;
                color: rgba(255, 255, 255, 0.55);
                font-size: 0.95rem;
            }

            .spinner[_ngcontent-ng-c2859620351] {
                width: 42px;
                height: 42px;
                border: 3px solid rgba(255, 255, 255, 0.1);
                border-top-color: #6366f1;
                border-radius: 50%;
                animation: _ngcontent-ng-c2859620351_spin 0.8s linear infinite;
            }

            @keyframes _ngcontent-ng-c2859620351_spin {
                to {
                    transform: rotate(360deg);
                }
            }

            .dashboard__error[_ngcontent-ng-c2859620351] {
                display: flex;
                align-items: center;
                gap: 12px;
                background: rgba(239, 68, 68, 0.12);
                border: 1px solid rgba(239, 68, 68, 0.35);
                border-radius: 14px;
                padding: 14px 20px;
                color: #fca5a5;
                font-size: 0.95rem;
                width: 100%;
                max-width: 600px;
                animation: _ngcontent-ng-c2859620351_slideIn 0.3s ease;
            }

            .dashboard__result[_ngcontent-ng-c2859620351] {
                width: 100%;
                animation: _ngcontent-ng-c2859620351_slideIn 0.4s ease;
            }

            @keyframes _ngcontent-ng-c2859620351_slideIn {
                from {
                    opacity: 0;
                    transform: translateY(12px);
                }

                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .dashboard__table-section[_ngcontent-ng-c2859620351] {
                width: 100%;
                animation: _ngcontent-ng-c2859620351_slideIn 0.4s ease;
            }

            .dashboard__section-title[_ngcontent-ng-c2859620351] {
                font-size: 1.25rem;
                font-weight: 700;
                color: rgba(255, 255, 255, 0.4);
                margin-bottom: 1rem;
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }

            /*# sourceMappingURL=posts-dashboard.component.css.map */
        </style>
        
    </head>
    <body>
        <app-root _nghost-ng-c3984273398="" ng-version="17.3.12" ng-server-context="ssr">
            </app-root>
    </body>
</html>
