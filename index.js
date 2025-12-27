import express from "express";
import fetch from "node-fetch";
import cheerio from "cheerio";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/scrape", async (req,res)=>{
  const { url } = req.body;
  const r = await fetch(url,{ headers:{ "User-Agent":"Mozilla/5.0" }});
  const html = await r.text();
  const $ = cheerio.load(html);

  const title = $('meta[property="og:title"]').attr("content") || $("title").text();
  const image = $('meta[property="og:image"]').attr("content");
  const price = $('[class*=price]').first().text().replace(/[^\d\.]/g,"");

  res.json({ title, image, price: parseFloat(price), store:new URL(url).hostname });
});

app.listen(process.env.PORT||3000)
