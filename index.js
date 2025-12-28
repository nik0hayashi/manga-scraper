import express from "express";
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/scrape", async (req, res) => {
  const { url } = req.body;

  try {
    const r = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept-Language": "en-US,en;q=0.9"
      }
    });

    const html = await r.text();
    const $ = cheerio.load(html);

    const title =
      $('meta[property="og:title"]').attr("content") ||
      $('meta[name="title"]').attr("content") ||
      $("h1").first().text().trim() ||
      $("title").text().trim();

    const image =
      $('meta[property="og:image"]').attr("content") ||
      $("img").first().attr("src") ||
      "";

    let priceText =
      $('meta[property="product:price:amount"]').attr("content") ||
      $('[class*=price]').first().text() ||
      $('[id*=price]').first().text() ||
      "";

    priceText = priceText.replace(",", ".").replace(/[^\d\.]/g, "");
    const price = parseFloat(priceText) || null;

    res.json({
      title: title || "Unknown title",
      image,
      price,
      store: new URL(url).hostname.replace("www.", "")
    });

  } catch (e) {
    res.status(500).json({ error: "Scraping failed" });
  }
});
