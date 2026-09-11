$ErrorActionPreference = 'Continue'
$ua = 'CuraMVP/1.0 (digital-heritage-education; local MVP; contact: cura-mvp)'
$artDir = 'C:\큐라\public\artifacts'
$musDir = 'C:\큐라\public\museums'
New-Item -ItemType Directory -Force -Path $artDir, $musDir | Out-Null

$files = @(
  @{ Out = "$musDir\gongju.jpg"; File = 'Gongju National Museum 01.jpg' },
  @{ Out = "$musDir\gimhae.jpg"; File = 'Gimhae national museum2.jpg' },
  @{ Out = "$musDir\free.jpg"; File = 'National Museum of Korea 2014 04.JPG' },

  @{ Out = "$artDir\gj-crown-king.jpg"; File = '무령왕 금제관식.jpg' },
  @{ Out = "$artDir\gj-crown-queen.jpg"; File = 'Baekje Diadem Queen.jpg' },
  @{ Out = "$artDir\gj-earrings-king.jpg"; File = 'Gold Earrings of King Muryeong 무령왕 금귀걸이 02-cropped.jpg' },
  @{ Out = "$artDir\gj-earrings-queen.jpg"; File = '무령왕비 금귀걸이.jpg' },
  @{ Out = "$artDir\gj-necklace-queen.jpg"; File = '무령왕비 금목걸이.jpg' },
  @{ Out = "$artDir\gj-seoksu.jpg"; File = '무령왕릉 석수.jpg' },
  @{ Out = "$artDir\gj-jiseok.jpg"; File = '무령왕릉 지석 02.jpg' },
  @{ Out = "$artDir\gj-mirror.jpg"; File = '무령왕릉 출토 신수문 청동거울.jpg' },
  @{ Out = "$artDir\gj-sword.jpg"; File = 'Ring-head sword in the tomb of Muryeong of Baekje.JPG' },
  @{ Out = "$artDir\gj-jar.jpg"; File = 'Jar.Stoneware.Baekje kingdom.Gongju National Museum.jpg' },
  @{ Out = "$artDir\gj-hairpin.jpg"; File = 'Korean hairpin-Dwikkoji-01.jpg' },
  @{ Out = "$artDir\gj-coffin.jpg"; File = '무령왕릉 목관 2024.jpg' },
  @{ Out = "$artDir\gj-stele.jpg"; File = '계유명삼존천불비상 01.jpg' },
  @{ Out = "$artDir\gj-stone-basin.jpg"; File = '공주 반죽동 석조.jpg' },

  @{ Out = "$artDir\gh-armor-local.jpg"; File = 'Gaya amour(5th c).jpg' },
  @{ Out = "$artDir\gh-crown-acc.jpg"; File = 'Gold Crown access NT138.jpg' },
  @{ Out = "$artDir\gh-pedestal.jpg"; File = 'Jar, pedestal.Gaya.Gimhae National Museum.jpg' },
  @{ Out = "$artDir\gh-shield.jpg"; File = '대성동 13호 고분 방패꾸미개 ver 02.JPG' },
  @{ Out = "$artDir\gh-cauldron.jpg"; File = '대성동 고분 47호 출토 청동솥.JPG' },
  @{ Out = "$artDir\gh-comb.jpg"; File = 'Comb-pattern Pottery. Suga-ri, Gimhae. Gimhae National Museum.jpg' },
  @{ Out = "$artDir\gh-duck.jpg"; File = 'Duck-shaped pottery 오리형 토기.jpg' },
  @{ Out = "$artDir\gh-armor-helmet.jpg"; File = 'Gaya Confederacy Iron Armor & Helmet.jpg' },
  @{ Out = "$artDir\gh-gilt-crown.jpg"; File = 'Gaya Confederacy Gilt Bronze Crown 02.jpg' },
  @{ Out = "$artDir\gh-earrings.jpg"; File = 'Gaya Confederacy Gold Earrings 01.jpg' },
  @{ Out = "$artDir\gh-swords.jpg"; File = 'Gaya Confederacy Iron Swords.jpg' },
  @{ Out = "$artDir\gh-glass.jpg"; File = 'Gaya Confederacy Glass Bowl.jpg' },
  @{ Out = "$artDir\gh-boat.jpg"; File = 'Gaya Confederacy Pottery Boat (17972191906).jpg' },
  @{ Out = "$artDir\gh-rhyton.jpg"; File = 'Gaya Confederacy Pottery Rhyton (17376366853).jpg' },
  @{ Out = "$artDir\gh-horse-armor.jpg"; File = 'Gaya Confederacy Horse Armor.jpg' },
  @{ Out = "$artDir\gh-stirrups.jpg"; File = 'Gaya Confederacy Iron Stirrups (17378457343).jpg' },
  @{ Out = "$artDir\gh-turtle.jpg"; File = '부산 복천동 11호분 출토 도기 거북장식 원통형 기대 및 단경호.jpg' },

  @{ Out = "$artDir\fr-silla-crown.jpg"; File = 'Gold Crown of Silla Kingdom 01b.jpg' },
  @{ Out = "$artDir\fr-pensive.jpg"; File = 'Pensive Bodhisattva (National Treasure No. 78) 01.jpg' },
  @{ Out = "$artDir\fr-moonjar.jpg"; File = 'White Porcelain Moon Jar (National Treasure No. 262) 03.jpg' },
  @{ Out = "$artDir\fr-celadon.jpg"; File = 'Celadon incense burner, Goryeo dynasty, 12th century, National Museum of Korea.jpg' },
  @{ Out = "$artDir\fr-hunmin.jpg"; File = 'Hunminjeongeum.jpg' },
  @{ Out = "$artDir\fr-dagger.jpg"; File = 'Bronze Dagger and Scabbard. Restauration. Gimhae National Museum.jpg' },
  @{ Out = "$artDir\fr-incense.jpg"; File = 'Gilt-bronze Incense Burner of Baekje.jpg' },
  @{ Out = "$artDir\fr-incense2.jpg"; File = 'Korea-Buyeo-Gilt-bronze incense burner.jpg' },
  @{ Out = "$artDir\fr-nmk.jpg"; File = 'National Museum of Korea 2014 04.JPG' }
)

function Get-Wiki([string]$file, [string]$outPath) {
  $encoded = [uri]::EscapeDataString($file)
  $url = "https://commons.wikimedia.org/wiki/Special:FilePath/$encoded`?width=1280"
  Write-Host "GET $file"
  & curl.exe -sS -L --fail -A $ua -o $outPath $url
  if ($LASTEXITCODE -eq 0 -and (Test-Path $outPath) -and ((Get-Item $outPath).Length -gt 2000)) {
    Write-Host ("  OK " + (Get-Item $outPath).Length)
    return $true
  }
  Write-Host "  FAIL $file"
  if (Test-Path $outPath) { Remove-Item $outPath -Force }
  return $false
}

$ok = 0; $fail = 0
foreach ($item in $files) {
  if (Test-Path $item.Out) {
    $len = (Get-Item $item.Out).Length
    if ($len -gt 2000) { $ok++; Write-Host "SKIP $($item.Out)"; continue }
  }
  if (Get-Wiki $item.File $item.Out) { $ok++ } else { $fail++ }
}
Write-Host "DONE ok=$ok fail=$fail"
Get-ChildItem $artDir, $musDir | Select-Object Name, Length | Format-Table -AutoSize
